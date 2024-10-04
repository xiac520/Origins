function GoGoGadget() {
  var url = document.getElementById('url');
  var jsonp = document.getElementById('jsonp');
  var jsonpText = '';

  jsonpText += "// 使用 fetch\n";
  jsonpText += "fetch(`https://origins.dnscron.com/get?url=${encodeURIComponent('" + url.value + "')}`)\n";
  jsonpText += "  .then(response => {\n";
  jsonpText += "    if (response.ok) return response.json();\n";
  jsonpText += "    throw new Error('网络响应不正确。');\n";
  jsonpText += "  })\n";
  jsonpText += "  .then(data => console.log(data.contents));\n\n";

  jsonpText += "// 使用 jQuery\n";
  jsonpText += "$.getJSON('https://origins.dnscron.com/get?url=" + escape(url.value) + "&callback=?', function (data) {\n";
  jsonpText += "  $('#output').html(data.contents);\n";
  jsonpText += "});\n";

  jsonp.textContent = jsonpText;

  var xmlhttp = new XMLHttpRequest();

  xmlhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      var myArr = JSON.parse(this.responseText);
      updatePreview(myArr);
    }
  };

  xmlhttp.open('GET', 'https://origins.dnscron.com/get?url=' + escape(url.value), true);
  xmlhttp.send();

  function updatePreview(data) {
    var outputJSON = document.getElementById('output-json');
    var iframe = document.getElementById('output');
    var doc = iframe.document;

    if (iframe.contentDocument) {
      doc = iframe.contentDocument;
    } else if (iframe.contentWindow) {
      doc = iframe.contentWindow.document;
    }
    doc.open();
    doc.writeln(data.contents);
    doc.close();

    outputJSON.textContent = JSON.stringify(data);
  }
  return false;
}