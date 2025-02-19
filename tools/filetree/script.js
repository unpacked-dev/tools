document.addEventListener("DOMContentLoaded", (event) => {
  onPageLoaded();
});

function onPageLoaded() {
  switchPage(checkBrowser() ? "main" : "unsupportedBrowser");
  addDynamicEventListener("click", ".page-nav", function(event) {
    switchPage(event.target.getAttribute("data-page-nav") || "main");
  });
  addDynamicEventListener("click", ".code-copy code", function(event) {
    const content = event.target.innerHTML;
    navigator.clipboard.writeText(content);
  });
}

function checkBrowser() {
  return typeof window.showDirectoryPicker === 'function';
}

function switchPage(id) {
  const pages = document.querySelectorAll("main.page");
  for (const page of pages) {
    if (page.classList.contains(`page-${id}`)) {
      page.style.display = "flex";
    } else {
      page.style.display = "none";
    }
  }
}

let foundFiles = [];
let fileID = 0;
async function scanDirectory(handle, parent) {
  for await (const entry of handle.values()) {
    fileID++;

    foundFiles.push({
      id: fileID,
      name: entry.name,
      kind: entry.kind,
      parent: parent,
    });

    if (entry.kind === "directory") {
      await scanDirectory(entry, fileID);
    }
  }
}


async function onPickDirectory() {
  const dirHandle = await window.showDirectoryPicker();
  window.rootDirectoryName = dirHandle.name;

  await scanDirectory(dirHandle, 0);
  await renderDirectoryTree();

  show_result_container();
}

function show_result_container() {
  document.querySelector(".result-container").style.display = 'flex';
}

async function renderDirectoryTree() {
  console.log(foundFiles);
  await renderDirectoryTreeCode();
}

async function renderDirectoryTreeCode() {
  const container = document.querySelector(".directory-tree-code");
  const spaces = 2;
  const indentSpaces = " ".repeat(spaces);
  const branchIndent = "│" + " ".repeat(spaces - 1);

  const nodesByParent = {};
  for (const node of foundFiles) {
    const parentKey = (node.parent === undefined ? 0 : node.parent);
    if (!nodesByParent[parentKey]) {
      nodesByParent[parentKey] = [];
    }
    nodesByParent[parentKey].push(node);
  }

  function buildTreeString(parentId, prefix) {
    let result = "";
    const children = nodesByParent[parentId] || [];
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      const isLast = i === children.length - 1;
      const branch = isLast ? "└" : "├";
      result += prefix + branch + " " + child.name + (child.kind === "directory" ? "/" : "") + "\n";
      if (child.kind === "directory") {
        const newPrefix = prefix + (isLast ? indentSpaces : branchIndent);
        result += buildTreeString(child.id, newPrefix);
      }
    }
    return result;
  }

  const rootName = window.rootDirectoryName || "Extension";
  const tree = rootName + "/\n" + buildTreeString(0, indentSpaces);

  container.innerHTML = `<pre><code>${tree}</code></pre>`;
}

const dynamicEventListeners = [];
function addDynamicEventListener(event, selector, handler) {
  if (!dynamicEventListeners[event]) {
    dynamicEventListeners[event] = [];
    document.addEventListener(event, function (e) {
      for (const listener of dynamicEventListeners[event]) {
        if (e.target.matches(listener.selector)) {
          listener.handler(e);
        }
      }
    });
  }
  dynamicEventListeners[event].push({ selector: selector, handler: handler });
}