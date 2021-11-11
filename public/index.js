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
  request("post", `/exec/${groupId}`, {}, response => {
    console.log(response);
  });
}
