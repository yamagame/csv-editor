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

let activeGroup = -1;

function exec() {
  if (activeGroup < 0) return;
  request("post", `exec/${activeGroup}`, {}, response => {
    console.log(response);
  });
}

function loadReadme(element, groupId) {
  const groups = document.querySelectorAll(".group-name");
  groups.forEach(group => group.classList.remove("csv-group-active"));
  const scriptButton = document.querySelector(".csv-script-button");
  scriptButton.disabled = false;
  element.classList.add("csv-group-active");
  activeGroup = groupId;
  request("get", `readme/${groupId}`, {}, response => {
    const element = document.querySelector(".csv-instrcution-container");
    element.innerText = response;
  });
}
