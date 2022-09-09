const PSD = require("psd");
window.jsPDF = window.jspdf.jsPDF;

let count = 0;

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("file").addEventListener("change", loadPsd, false);
  document
    .getElementById("btn-download")
    .addEventListener("click", downloadPdf, false);

  interact(".drag-drop").draggable({
    inertia: true,
    autoScroll: true,
    listeners: { move: dragMoveListener },
  });
});

const dragMoveListener = (event) => {
  const target = event.target;
  const x = (parseFloat(target.getAttribute("data-x")) || 0) + event.dx;
  const y = (parseFloat(target.getAttribute("data-y")) || 0) + event.dy;

  target.style.transform = "translate(" + x + "px, " + y + "px)";
  target.style.zIndex = parseInt(new Date().getTime() / 1000);

  target.setAttribute("data-x", x);
  target.setAttribute("data-y", y);
};

const previewArea = document.getElementById("inner-dropzone");

const loadPsd = async (e) => {
  console.time("parse");
  document.getElementById("images").innerHTML = "";
  e.dataTransfer = document.getElementById("file");
  await PSD.fromEvent(e).then((psd) => {
    const nodes = psd.tree().descendants();
    nodes.forEach((node) => {
      searchForImage(node);
    });
  });
  if (count) previewArea.style.display = "block";
  console.timeEnd("parse");
};

const searchForImage = (node) => {
  if (node && node.hasChildren()) {
    node.children().forEach((n) => {
      searchForImage(n);
    });
  } else if (node) {
    count++;
    const img = node.toPng();
    img.id = `img_${count}`;
    img.classList.add("drag-drop");
    document.getElementById("images").appendChild(img);
  }
};

const downloadPdf = () => {
  const images = document.getElementsByTagName("img");

  if (!images.length) {
    alert("Please choose file psd!");
    return;
  }

  const doc = new jsPDF("p", "px");
  const max = {
    height: doc.internal.pageSize.getHeight(),
    width: doc.internal.pageSize.getWidth(),
  };

  for (let img of images) {
    let height = img.height;
    let width = img.width;
    let ratio = img.height / img.width;
    if (height > max.height || width > max.width) {
      if (height > width) {
        height = max.height;
        width = height * (1 / ratio);
      } else if (width > height) {
        width = max.width;
        height = width * ratio;
      }
      doc.addImage(img.src, "png", 0, 0, width * 0.5, height * 0.5);
    } else {
      doc.addImage(img.src, "png", 0, 0);
    }
    doc.addPage("p", "px");
  }
  doc.save("psd_to_pdf.pdf");
};
