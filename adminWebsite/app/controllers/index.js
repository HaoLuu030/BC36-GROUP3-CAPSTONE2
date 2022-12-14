import { ProductService } from "../services/product.js";
import { Product } from "../models/product.js";
//Changed all the var declaration into let or const declaration
let productList = [];
// Created new service to the product list
const productService = new ProductService();

// Added resusable function for cleaner code
const domId = (id) => document.getElementById(id);

//get the list from database

const getProductList = () => {
  productService.getList().then((response) => {
    productList = [...response.data];
    renderProductList(productList);
    renderType("Tất cả", "filter-list");
  });
};

//Change variable name "item" into "product"
domId("addBtn").onclick = () => {
  domId("QL").reset();
  document.querySelectorAll(".errorSpan").forEach((element) => {
    element.innerHTML = "";
  });
  domId("modalTitle").innerHTML = "Thêm sản phẩm";
  domId("modal-footer").innerHTML = `
  <button type="button" class="btn btn-secondary close-btn" data-dismiss="modal">Đóng</button>
  <button type="button" class="btn btn-success" onclick="addProduct()">Thêm</button></button>`;
  renderType("Chọn loại", "type");
};

const getFormValue = () => {
  const formValue = {
    name: domId("name").value,
    price: domId("price").value,
    screen: domId("screen").value,
    backCamera: domId("backCamera").value,
    frontCamera: domId("frontCamera").value,
    img: domId("img").value,
    desc: domId("desc").value,
    type: domId("type").value,
  };

  return formValue;
};
const validateForm = () => {
  const formValue = getFormValue();
  const { name, price, screen, backCamera, frontCamera, img, desc, type } =
    formValue;
  let isValid = true;
  isValid &=
    required(name, "spanName") && validateProductName(name, "spanName");
  isValid &= required(price, "spanPrice") && validatePrice(price, "spanPrice");

  isValid &= required(img, "spanImg") && validateImgInput(img, "spanImg");

  isValid &=
    required(screen, "spanScreen") && validateScreenType(screen, "spanScreen");

  isValid &= required(backCamera, "spanBackCamera");

  isValid &= required(frontCamera, "spanFrontCamera");

  isValid &= required(desc, "spanDescription");
  isValid &= validateProductType(type, "spanType");

  return isValid;
};

window.addProduct = () => {
  const isValid = validateForm();
  if (!isValid) {
    return;
  }
  //destructuring
  const values = getFormValue();
  const { name, price, screen, backCamera, frontCamera, img, desc, type } =
    values;

  // check if the product has already existed in the list
  const hasExisted = productList.find((element) => {
    return element.name === name;
  });

  if (hasExisted) {
    alert("Đã có thông tin của sản phẩm này trong kho");
    return;
  }

  let product = new Product(
    name,
    price,
    screen,
    backCamera,
    frontCamera,
    img,
    desc,
    type
  );

  productService.addProduct(product);
  alert("Thêm sản phẩm thành công");
  domId("QL").reset();
  getProductList();
};

function renderProductList(data = productList) {
  //changed "for" loop to higher order function for cleaner code
  let html = data.reduce((total, element, idx) => {
    total += `
    <tr>
      <td class="tb-cell">${idx + 1}</td>
      <td class="tb-cell">${element.name}</td>
      <td class="tb-cell">$ ${element.price}</td>
      <td class="tb-cell">
       - Màn hình: ${element.screen} <br>
       - Camera trước: ${element.frontCamera} <br>
       - Camera sau: ${element.backCamera}
      </td>
      <td class="tb-cell center-align">
      <a href="${element.img}" target="_blank">Link</a>
      </td>
      <td class="tb-cell center-align">
      <button onclick="getUpdateForm('${
        element.id
      }')" class="btn btn-warning" data-toggle="modal" data-target="#exampleModal">
      <i class="fa fa-pencil-alt"></i>
      </button>
      <button onclick="deleteProduct('${
        element.id
      }')" class="btn btn-danger"><i class="fa fa-trash-alt"></i></button>
      </td>
    </tr>`;

    return total;
  }, "");

  domId("tableDanhSach").innerHTML = html;
}

window.deleteProduct = (id) => {
  productService.deleteProduct(id);
  alert("Xóa sản phẩm thành công");
  getProductList();
};

window.getUpdateForm = (id) => {
  domId("modalTitle").innerHTML = "Cập nhật sản phẩm";

  document.querySelectorAll(".errorSpan").forEach((element) => {
    element.innerHTML = "";
  });

  domId("modal-footer").innerHTML = `
  <button type="button" class="btn btn-secondary close-btn" data-dismiss="modal">Đóng</button>
  <button type="button" class="btn btn-primary" onclick="updateProduct(${id})">Cập nhật</button></button>`;

  renderType(0, "type");

  productService.getProductbyId(id).then((response) => {
    const selectedProduct = response.data;
    domId("name").value = selectedProduct.name;
    domId("price").value = selectedProduct.price;
    domId("screen").value = selectedProduct.screen;
    domId("backCamera").value = selectedProduct.backCamera;
    domId("frontCamera").value = selectedProduct.frontCamera;
    domId("img").value = selectedProduct.img;
    domId("desc").value = selectedProduct.desc;
    domId("type").value = selectedProduct.type;
  });
};

window.updateProduct = (id) => {
  const isValid = validateForm();
  if (!isValid) {
    return;
  }
  const values = getFormValue();

  const { name, price, screen, backCamera, frontCamera, img, desc, type } =
    values;

  let newProduct = new Product(
    name,
    price,
    screen,
    backCamera,
    frontCamera,
    img,
    desc,
    type
  );

  productService.getProductbyId(id).then((response) => {
    const oldProduct = response.data;
    if (
      newProduct.name != oldProduct.name ||
      newProduct.price != oldProduct.price ||
      newProduct.screen != oldProduct.screen ||
      newProduct.backCamera != oldProduct.backCamera ||
      newProduct.frontCamera != oldProduct.frontCamera ||
      newProduct.img != oldProduct.img ||
      newProduct.desc != oldProduct.desc ||
      oldProduct.type != newProduct.type
    ) {
      productService.updateProduct(id, newProduct).then(() => {
        document.querySelector(".close-btn").click();
        alert("Cập nhật thành công");
        domId("QL").reset(); // reset form
        getProductList();
      });
    } else {
      alert("Không có thông tin nào thay đổi");
    }
  });
};

window.searchItem = () => {
  const result = [];
  const keyword = domId("searchName").value;
  const nameRegex = /^[A-Za-z]/;

  for (let i in productList) {
    const name = productList[i].name;
    if (
      nameRegex.test(keyword) &&
      name.toLowerCase().includes(keyword.toLowerCase())
    ) {
      result.push(productList[i]);
    }
  }

  if (result.length === 0) {
    alert("Không tìm thấy sản phẩm phù hợp");
    return;
  }

  renderProductList(result);
};

const renderType = (title = 0, target) => {
  let typeList = [...productService.productType];
  const content = typeList.reduce((total, element) => {
    total += `<option value="${element}">${element}</option>`;
    return total;
  }, "");

  if (title) {
    domId(target).innerHTML = `<option value='0'>${title}</option>`.concat(
      content
    );
  } else {
    domId(target).innerHTML = content;
  }
};

domId("filter-list").onchange = (event) => {
  const value = event.target.value;
  const selectedProducts = productList.filter((element) => {
    if (element.type === value) {
      return true;
    }

    if (value == 0) {
      return true;
    }
  });

  renderProductList(selectedProducts);
};

//validate stuff

const required = (value, spanId) => {
  if (value.length === 0) {
    domId(spanId).innerHTML = "*Trường này không được bỏ trống";
    return false;
  }
  domId(spanId).innerHTML = "";
  return true;
};

const validateProductName = (value, spanId) => {
  const nameRegex = /^[a-zA-Z]{1}[A-Za-z0-9 ]*$/;
  if (!nameRegex.test(value)) {
    domId(spanId).innerHTML =
      "*Tên sản phẩm phải bắt đầu bằng chữ cái và không được chứa các ký tự đặc biệt";
    return false;
  }
  domId(spanId).innerHTML = "";
  return true;
};

const validatePrice = (value, spanId) => {
  const priceRegex = /^\d*$/;
  if (!priceRegex.test(value)) {
    domId(spanId).innerHTML = "* Giá chỉ được nhập số";
    return false;
  } else if (value * 1 < 500 || value * 1 > 10000) {
    domId(spanId).innerHTML =
      "* Giá chỉ được nằm trong khoảng từ $500 đến $1000";
    return false;
  }
  domId(spanId).innerHTML = "";
  return true;
};

const validateImgInput = (value, spanId) => {
  const imgRegex = /.*(\.jpg|\.jpeg|\.png|\.gif)$/i;
  if (!imgRegex.test(value)) {
    domId(spanId).innerHTML =
      "*Link hình ảnh phải nhập định dạng (jpg, jpeg, png hay gif)";
    return false;
  }
  domId(spanId).innerHTML = "";
  return true;
};

const validateScreenType = (value, spanId) => {
  const screenRegex = /screen \d+/i;
  if (!screenRegex.test(value)) {
    domId(spanId).innerHTML =
      "*Định dạng màn hình đúng: screen + [một số bất kỳ] (screen 57)";
    return false;
  }
  domId(spanId).innerHTML = "";
  return true;
};

const validateProductType = (value, spanId) => {
  if (value == 0) {
    domId(spanId).innerHTML = "*Vui lòng chọn loại cho sản phẩm";
    return false;
  }

  domId(spanId).innerHTML = "";
  return true;
};

window.onload = () => {
  getProductList();
};
