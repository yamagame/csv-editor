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

function main() {
  //
}

function exec(groupId) {
  if (groupId < 0) return;
  const inputs = Array.from(document.querySelectorAll(".csv-option-input"));
  const options = Array.from(document.querySelectorAll(".csv-option-selector"));
  const body = [...options, ...inputs].map(v => ({
    name: v.getAttribute("name"),
    value: v.value,
  }));
  request("post", `/exec/${groupId}`, body, response => {
    console.log(response);
  });
}
