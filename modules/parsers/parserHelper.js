module.exports = {
    parseTable: function (document, selector, tableIndex, headerRowIndex, dataStartRowIndex, useThead) {
        headerRowIndex = typeof(headerRowIndex) !== 'undefined' ? headerRowIndex : 0;
        dataStartRowIndex = typeof(dataStartRowIndex) !== 'undefined' ? dataStartRowIndex : 0;
        useThead = typeof(useThead) !== 'undefined' ? useThead : true;

        var headers = [];
        if (useThead) {
            document(selector).eq(tableIndex).find('thead tr').eq(headerRowIndex).find('th').each(function (i, elem) {
                headers[i] = document(elem).text();
            });
        } else {
            document(selector).eq(tableIndex).find('tbody tr').eq(headerRowIndex).find('td').each(function (i, elem) {
                headers[i] = document(elem).text();
            })
        }

        var data = [];
        document(selector).eq(tableIndex).find('tbody tr').each(function (rowIndex, elem) {
            if (rowIndex >= dataStartRowIndex) {
                var rowData = {};
                document('td', elem).each(function (j, innerElem) {
                    rowData[headers[j]] = document(innerElem).text();
                });
                data[rowIndex - dataStartRowIndex] = rowData;
            }
        });

        return data;
    }
};

/*
 function parseTableHeaders(document, selector, tableIndex, useThead, startIndex) {
 useThead = typeof useThead !== 'undefined'? useThead : true;
 startIndex = typeof startIndex !== 'undefined'? startIndex : 0;

 var headers = [];
 var data = [];

 if (useThead) {
 document(selector).eq(index).find('thead ')
 }
 }

 function parseTable(document, selector, index) {
 var data = [];
 var headers = [];

 document(selector).eq(index).find('thead th').each(function(i, elem) {
 headers[i] = document(elem).text();
 });
 document(selector).eq(index).find('tbody tr').each(function(i, elem) {
 var rowData = {};
 document('td', elem).each(function(j, innerElem) {
 rowData[headers[j]] = document(innerElem).text();
 });
 data[i] = rowData;
 });
 return data;
 }
 */

