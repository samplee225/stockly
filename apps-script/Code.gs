/**
 * =========================================================================
 * MINIMAL STOCK INVENTORY APP — GOOGLE APPS SCRIPT BACKEND
 * =========================================================================
 * 
 * Persistent database: Google Sheets
 * Backend API: Google Apps Script Web App
 * 
 * Sheets:
 *  1. Products:     productId | title | quantity | imageUrl | description | createdAt | updatedAt
 *  2. Transactions: transactionId | productId | productTitle | type | quantity | timestamp
 * 
 * Endpoints:
 *  - GET_PRODUCTS
 *  - GET_PRODUCT
 *  - CREATE_PRODUCT
 *  - UPDATE_PRODUCT
 *  - DELETE_PRODUCT
 *  - GET_TRANSACTIONS
 *  - CREATE_TRANSACTION
 *  - GET_SUMMARY
 *  - INITIALIZE_SHEETS
 */

// Configuration: Spreadsheet ID (If blank, uses ActiveSpreadsheet when bound)
var SPREADSHEET_ID = '';

var PRODUCT_HEADERS = ['productId', 'title', 'quantity', 'imageUrl', 'description', 'createdAt', 'updatedAt'];
var TRANSACTION_HEADERS = ['transactionId', 'productId', 'productTitle', 'type', 'quantity', 'timestamp'];

/**
 * Returns the active or configured Spreadsheet.
 */
function getSpreadsheet() {
  if (SPREADSHEET_ID && SPREADSHEET_ID.trim() !== '') {
    return SpreadsheetApp.openById(SPREADSHEET_ID.trim());
  }
  return SpreadsheetApp.getActiveSpreadsheet();
}

/**
 * Ensures required sheets and headers exist safely without wiping existing records.
 */
function ensureSheetsInitialized(ss) {
  var productsSheet = ss.getSheetByName('Products');
  if (!productsSheet) {
    productsSheet = ss.insertSheet('Products');
    productsSheet.appendRow(PRODUCT_HEADERS);
  } else if (productsSheet.getLastRow() === 0) {
    productsSheet.appendRow(PRODUCT_HEADERS);
  }

  var transSheet = ss.getSheetByName('Transactions');
  if (!transSheet) {
    transSheet = ss.insertSheet('Transactions');
    transSheet.appendRow(TRANSACTION_HEADERS);
  } else if (transSheet.getLastRow() === 0) {
    transSheet.appendRow(TRANSACTION_HEADERS);
  }

  return { productsSheet: productsSheet, transSheet: transSheet };
}

/**
 * Generates an ISO-8601 UTC timestamp.
 */
function getTimestamp() {
  return new Date().toISOString();
}

/**
 * Generates a unique ID with a prefix.
 */
function generateId(prefix) {
  return prefix + '-' + new Date().getTime().toString(36) + '-' + Math.random().toString(36).substring(2, 7);
}

/**
 * Helper to build JSON responses with proper CORS headers.
 */
function jsonResponse(success, data, message) {
  var output = {
    success: success,
    data: data,
    message: message || (success ? 'Operation successful' : 'Operation failed')
  };
  return ContentService.createTextOutput(JSON.stringify(output))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Handles HTTP GET requests.
 * Allows query parameters such as ?action=GET_PRODUCTS or ?action=GET_SUMMARY
 */
function doGet(e) {
  try {
    var params = e && e.parameter ? e.parameter : {};
    var action = (params.action || 'GET_PRODUCTS').toUpperCase();

    var ss = getSpreadsheet();
    var sheets = ensureSheetsInitialized(ss);

    switch (action) {
      case 'GET_PRODUCTS':
        return handleGetProducts(sheets.productsSheet);

      case 'GET_PRODUCT':
        if (!params.productId) {
          return jsonResponse(false, null, 'productId is required');
        }
        return handleGetProduct(sheets.productsSheet, params.productId);

      case 'GET_TRANSACTIONS':
        var limit = params.limit ? parseInt(params.limit, 10) : 50;
        return handleGetTransactions(sheets.transSheet, limit);

      case 'GET_SUMMARY':
        return handleGetSummary(sheets.productsSheet);

      case 'INITIALIZE_SHEETS':
        return jsonResponse(true, null, 'Sheets initialized successfully');

      default:
        return jsonResponse(false, null, 'Unknown GET action: ' + action);
    }
  } catch (error) {
    return jsonResponse(false, null, 'Server error: ' + error.toString());
  }
}

/**
 * Handles HTTP POST requests.
 * Accepts JSON payloads formatted as text/plain to avoid CORS preflight failures.
 */
function doPost(e) {
  var lock = LockService.getScriptLock();
  var lockAcquired = false;

  try {
    var body = {};
    if (e && e.postData && e.postData.contents) {
      try {
        body = JSON.parse(e.postData.contents);
      } catch (err) {
        return jsonResponse(false, null, 'Invalid JSON body in request: ' + err.toString());
      }
    } else if (e && e.parameter) {
      body = e.parameter;
    }

    var action = (body.action || '').toUpperCase();
    var data = body.data || body;

    var ss = getSpreadsheet();
    var sheets = ensureSheetsInitialized(ss);

    // Operations modifying inventory require the script lock
    var lockingActions = ['CREATE_PRODUCT', 'UPDATE_PRODUCT', 'DELETE_PRODUCT', 'CREATE_TRANSACTION'];
    if (lockingActions.indexOf(action) !== -1) {
      lock.waitLock(30000); // Wait up to 30s
      lockAcquired = true;
    }

    switch (action) {
      case 'GET_PRODUCTS':
        return handleGetProducts(sheets.productsSheet);

      case 'GET_PRODUCT':
        return handleGetProduct(sheets.productsSheet, data.productId);

      case 'CREATE_PRODUCT':
        return handleCreateProduct(sheets.productsSheet, data);

      case 'UPDATE_PRODUCT':
        return handleUpdateProduct(sheets.productsSheet, data);

      case 'DELETE_PRODUCT':
        return handleDeleteProduct(sheets.productsSheet, data.productId);

      case 'GET_TRANSACTIONS':
        var limit = data.limit ? parseInt(data.limit, 10) : 50;
        return handleGetTransactions(sheets.transSheet, limit);

      case 'CREATE_TRANSACTION':
        return handleCreateTransaction(sheets.productsSheet, sheets.transSheet, data);

      case 'GET_SUMMARY':
        return handleGetSummary(sheets.productsSheet);

      default:
        return jsonResponse(false, null, 'Unknown POST action: ' + action);
    }
  } catch (error) {
    return jsonResponse(false, null, 'Execution error: ' + error.toString());
  } finally {
    if (lockAcquired) {
      try {
        lock.releaseLock();
      } catch (e) {
        // Ignored
      }
    }
  }
}

// -----------------------------------------------------------------------------
// ACTION HANDLERS
// -----------------------------------------------------------------------------

/**
 * GET_PRODUCTS: Returns list of all products.
 */
function handleGetProducts(sheet) {
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) {
    return jsonResponse(true, [], 'No products found');
  }

  var values = sheet.getRange(2, 1, lastRow - 1, 7).getValues();
  var products = [];

  for (var i = 0; i < values.length; i++) {
    var row = values[i];
    if (row[0]) { // Check if productId exists
      products.push({
        productId: String(row[0]),
        title: String(row[1] || ''),
        quantity: Number(row[2]) || 0,
        imageUrl: String(row[3] || ''),
        description: String(row[4] || ''),
        createdAt: row[5] ? String(row[5]) : '',
        updatedAt: row[6] ? String(row[6]) : ''
      });
    }
  }

  return jsonResponse(true, products, 'Products loaded successfully');
}

/**
 * GET_PRODUCT: Returns a single product by productId.
 */
function handleGetProduct(sheet, productId) {
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) {
    return jsonResponse(false, null, 'Product not found');
  }

  var values = sheet.getRange(2, 1, lastRow - 1, 7).getValues();
  for (var i = 0; i < values.length; i++) {
    if (String(values[i][0]) === String(productId)) {
      var row = values[i];
      var product = {
        productId: String(row[0]),
        title: String(row[1] || ''),
        quantity: Number(row[2]) || 0,
        imageUrl: String(row[3] || ''),
        description: String(row[4] || ''),
        createdAt: row[5] ? String(row[5]) : '',
        updatedAt: row[6] ? String(row[6]) : ''
      };
      return jsonResponse(true, product, 'Product found');
    }
  }

  return jsonResponse(false, null, 'Product not found');
}

/**
 * CREATE_PRODUCT: Adds a new product record.
 */
function handleCreateProduct(sheet, data) {
  var title = (data.title || '').trim();
  if (!title) {
    return jsonResponse(false, null, 'Product title is required');
  }

  var quantity = Number(data.quantity);
  if (isNaN(quantity) || quantity < 0 || Math.floor(quantity) !== quantity) {
    return jsonResponse(false, null, 'Quantity must be a non-negative whole number');
  }

  var productId = generateId('prod');
  var imageUrl = (data.imageUrl || '').trim();
  if (imageUrl.length > 48000) {
    imageUrl = imageUrl.substring(0, 48000);
  }
  var description = (data.description || '').trim();
  var now = getTimestamp();

  sheet.appendRow([productId, title, quantity, imageUrl, description, now, now]);

  var newProduct = {
    productId: productId,
    title: title,
    quantity: quantity,
    imageUrl: imageUrl,
    description: description,
    createdAt: now,
    updatedAt: now
  };

  return jsonResponse(true, newProduct, 'Product created successfully');
}

/**
 * UPDATE_PRODUCT: Updates an existing product details (title, imageUrl, description, quantity).
 */
function handleUpdateProduct(sheet, data) {
  var productId = data.productId;
  if (!productId) {
    return jsonResponse(false, null, 'Product ID is required for update');
  }

  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) {
    return jsonResponse(false, null, 'Product not found');
  }

  var values = sheet.getRange(2, 1, lastRow - 1, 7).getValues();
  var rowIndex = -1;

  for (var i = 0; i < values.length; i++) {
    if (String(values[i][0]) === String(productId)) {
      rowIndex = i + 2; // 1-based, plus 1 for header
      break;
    }
  }

  if (rowIndex === -1) {
    return jsonResponse(false, null, 'Product not found');
  }

  var currentRow = values[rowIndex - 2];
  var updatedTitle = data.title !== undefined ? String(data.title).trim() : String(currentRow[1]);
  if (!updatedTitle) {
    return jsonResponse(false, null, 'Product title cannot be empty');
  }

  var updatedQuantity = data.quantity !== undefined ? Number(data.quantity) : Number(currentRow[2]);
  if (isNaN(updatedQuantity) || updatedQuantity < 0 || Math.floor(updatedQuantity) !== updatedQuantity) {
    return jsonResponse(false, null, 'Quantity must be a non-negative whole number');
  }

  var updatedImageUrl = data.imageUrl !== undefined ? String(data.imageUrl).trim() : String(currentRow[3]);
  if (updatedImageUrl.length > 48000) {
    updatedImageUrl = updatedImageUrl.substring(0, 48000);
  }
  var updatedDescription = data.description !== undefined ? String(data.description).trim() : String(currentRow[4]);
  var createdAt = String(currentRow[5]);
  var updatedAt = getTimestamp();

  sheet.getRange(rowIndex, 1, 1, 7).setValues([[
    productId,
    updatedTitle,
    updatedQuantity,
    updatedImageUrl,
    updatedDescription,
    createdAt,
    updatedAt
  ]]);

  var updatedProduct = {
    productId: productId,
    title: updatedTitle,
    quantity: updatedQuantity,
    imageUrl: updatedImageUrl,
    description: updatedDescription,
    createdAt: createdAt,
    updatedAt: updatedAt
  };

  return jsonResponse(true, updatedProduct, 'Product updated successfully');
}

/**
 * DELETE_PRODUCT: Deletes a product row.
 */
function handleDeleteProduct(sheet, productId) {
  if (!productId) {
    return jsonResponse(false, null, 'Product ID is required for deletion');
  }

  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) {
    return jsonResponse(false, null, 'Product not found');
  }

  var values = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
  for (var i = 0; i < values.length; i++) {
    if (String(values[i][0]) === String(productId)) {
      sheet.deleteRow(i + 2);
      return jsonResponse(true, { productId: productId }, 'Product deleted successfully');
    }
  }

  return jsonResponse(false, null, 'Product not found');
}

/**
 * GET_TRANSACTIONS: Returns recorded stock transactions in descending order (latest first).
 */
function handleGetTransactions(sheet, limit) {
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) {
    return jsonResponse(true, [], 'No transactions found');
  }

  var numRows = lastRow - 1;
  var values = sheet.getRange(2, 1, numRows, 6).getValues();
  var transactions = [];

  for (var i = values.length - 1; i >= 0; i--) {
    var row = values[i];
    if (row[0]) {
      transactions.push({
        transactionId: String(row[0]),
        productId: String(row[1] || ''),
        productTitle: String(row[2] || ''),
        type: String(row[3] || 'IN'),
        quantity: Number(row[4]) || 0,
        timestamp: row[5] ? String(row[5]) : ''
      });
      if (limit && transactions.length >= limit) {
        break;
      }
    }
  }

  return jsonResponse(true, transactions, 'Transactions loaded successfully');
}

/**
 * CREATE_TRANSACTION: Records a Stock In or Stock Out movement atomically.
 * Updates product quantity and appends a transaction record.
 */
function handleCreateTransaction(productsSheet, transSheet, data) {
  var productId = (data.productId || '').trim();
  if (!productId) {
    return jsonResponse(false, null, 'Product ID is required');
  }

  var type = (data.type || '').toUpperCase();
  if (type !== 'IN' && type !== 'OUT') {
    return jsonResponse(false, null, "Transaction type must be 'IN' or 'OUT'");
  }

  var moveQty = Number(data.quantity);
  if (isNaN(moveQty) || moveQty <= 0 || Math.floor(moveQty) !== moveQty) {
    return jsonResponse(false, null, 'Transaction quantity must be a positive whole number');
  }

  // 1. Find product in Products sheet
  var lastRow = productsSheet.getLastRow();
  if (lastRow <= 1) {
    return jsonResponse(false, null, 'Product not found in inventory');
  }

  var values = productsSheet.getRange(2, 1, lastRow - 1, 7).getValues();
  var productRowIndex = -1;
  var currentStock = 0;
  var productTitle = '';

  for (var i = 0; i < values.length; i++) {
    if (String(values[i][0]) === productId) {
      productRowIndex = i + 2;
      currentStock = Number(values[i][2]) || 0;
      productTitle = String(values[i][1] || 'Product ' + productId);
      break;
    }
  }

  if (productRowIndex === -1) {
    return jsonResponse(false, null, 'Product not found: ' + productId);
  }

  // 2. Validate stock availability for Stock Out
  var newStock = currentStock;
  if (type === 'IN') {
    newStock = currentStock + moveQty;
  } else if (type === 'OUT') {
    if (moveQty > currentStock) {
      return jsonResponse(false, null, 'Insufficient stock. Available: ' + currentStock + ', Requested: ' + moveQty);
    }
    newStock = currentStock - moveQty;
  }

  var timestamp = getTimestamp();
  var transactionId = generateId('tx');

  // 3. Atomically update product row
  productsSheet.getRange(productRowIndex, 3).setValue(newStock); // quantity column
  productsSheet.getRange(productRowIndex, 7).setValue(timestamp); // updatedAt column

  // 4. Append transaction record
  transSheet.appendRow([transactionId, productId, productTitle, type, moveQty, timestamp]);

  var result = {
    transactionId: transactionId,
    productId: productId,
    productTitle: productTitle,
    type: type,
    quantity: moveQty,
    timestamp: timestamp,
    previousStock: currentStock,
    currentStock: newStock
  };

  return jsonResponse(true, result, 'Stock ' + (type === 'IN' ? 'added' : 'removed') + ' successfully. New stock: ' + newStock);
}

/**
 * GET_SUMMARY: Calculates inventory totals and returns recent products.
 */
function handleGetSummary(productsSheet) {
  var lastRow = productsSheet.getLastRow();
  if (lastRow <= 1) {
    return jsonResponse(true, {
      totalProducts: 0,
      totalQuantity: 0,
      recentProducts: []
    }, 'Summary loaded');
  }

  var values = productsSheet.getRange(2, 1, lastRow - 1, 7).getValues();
  var totalProducts = 0;
  var totalQuantity = 0;
  var products = [];

  for (var i = 0; i < values.length; i++) {
    var row = values[i];
    if (row[0]) {
      var qty = Number(row[2]) || 0;
      totalProducts++;
      totalQuantity += qty;
      products.push({
        productId: String(row[0]),
        title: String(row[1] || ''),
        quantity: qty,
        imageUrl: String(row[3] || ''),
        description: String(row[4] || ''),
        createdAt: row[5] ? String(row[5]) : '',
        updatedAt: row[6] ? String(row[6]) : ''
      });
    }
  }

  // Sort by updatedAt descending for recent items
  products.sort(function(a, b) {
    return new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime();
  });

  var recentProducts = products.slice(0, 5);

  return jsonResponse(true, {
    totalProducts: totalProducts,
    totalQuantity: totalQuantity,
    recentProducts: recentProducts
  }, 'Summary loaded successfully');
}
