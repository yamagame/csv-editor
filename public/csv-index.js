let controller;

function main() {
  function request(method, url, body, callback) {
    const XHR = new XMLHttpRequest();
    XHR.addEventListener("load", function (event) {
      const response = () => {
        try {
          return JSON.parse(XHR.response);
        } catch {
          //
        }
        return XHR.response;
      };
      if (callback) callback(response());
    });
    XHR.addEventListener("error", function (event) {
      console.error(event);
    });
    XHR.open(method, url);
    XHR.setRequestHeader("content-type", "application/json");
    XHR.send(JSON.stringify(body));
  }

  controller = CsvTable(
    "/csv/view",
    "csv-table",
    ".csv-data-input",
    (file, text) => {
      request("post", "/csv/command", { file, text }, res => {
        console.log(res);
      });
    }
  );
}

function save() {
  controller.save("/csv/save");
}

function download() {
  controller.download("/csv/download");
}
