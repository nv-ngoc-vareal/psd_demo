const PSD = require("psd");
window.jsPDF = window.jspdf.jsPDF;

let count = 0;

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("file").addEventListener("change", loadPsd, false);
  document.getElementById("upload-image").addEventListener("change", loadImg, false);
  document
    .getElementById("btn-download")
    .addEventListener("click", downloadPdf, false);
  document
    .getElementById("btn-selected-download")
    .addEventListener("click", downloadSelectedPdf, false);
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
  target.classList.add("selected");

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
    const img = psd.image.toPng();
    img.id = 'img_first';
    img.style.display = 'none';
    img.classList.add("drag-drop");
    document.getElementById("images").appendChild(img);
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

const loadImg = (e) => {
  const img = document.createElement("img");
  img.src = URL.createObjectURL(e.target.files[0]);
  img.id = `img_${count++}`;
  img.width = 200;
  img.height = 300;
  img.classList.add("drag-drop");
  const images = document.getElementById("images");
  images.insertBefore(img, images.firstChild);
};

const downloadPdf = () => {
  // const images = document.getElementsByTagName("img");

  // if (!images.length) {
  //   alert("Please choose file psd!");
  //   return;
  // }

  // const doc = new jsPDF("p", "px");
  // const max = {
  //   height: doc.internal.pageSize.getHeight(),
  //   width: doc.internal.pageSize.getWidth(),
  // };

  // for (let img of images) {
  //   let height = img.height;
  //   let width = img.width;
  //   let ratio = img.height / img.width;
  //   if (height > max.height || width > max.width) {
  //     if (height > width) {
  //       height = max.height;
  //       width = height * (1 / ratio);
  //     } else if (width > height) {
  //       width = max.width;
  //       height = width * ratio;
  //     }
  //     doc.addImage(img.src, "png", 0, 0, width * 0.5, height * 0.5);
  //   } else {
  //     doc.addImage(img.src, "png", 0, 0);
  //   }
  //   doc.addPage("p", "px");
  // }
  // doc.save("psd_to_pdf.pdf");
  const image = document.getElementById('img_first');
  const doc = new jsPDF("p", "px");
  const max = {
    height: doc.internal.pageSize.getHeight(),
    width: doc.internal.pageSize.getWidth(),
  };
  let height = image.height;
  let width = image.width;
  let ratio = image.height / image.width;
  if (height > max.height || width > max.width) {
    if (height > width) {
      height = max.height;
      width = height * (1 / ratio);
    } else if (width > height) {
      width = max.width;
      height = width * ratio;
    }
    doc.addImage(image.src, "png", 0, 0, width * 0.8, height * 0.8);
  } else {
    doc.addImage(image.src, "png", 0, 0);
  }
  doc.save("psd_to_pdf.pdf");
};

const sortByZIndex = (a, b) => {
  return a.style.zIndex - b.style.zIndex;
}

const downloadSelectedPdf = () => {
  const images = document.getElementsByClassName("selected");
  if (!images.length) {
    alert("Please choose file psd!");
    return;
  }

  const doc = new jsPDF("p", "px");
  const max = {
    height: doc.internal.pageSize.getHeight(),
    width: doc.internal.pageSize.getWidth(),
  };

  const sortedImages = Array.from(images).sort(sortByZIndex);

  for (let img of sortedImages) {
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
  }
  doc.save("psd_selected_pdf.pdf");
}
