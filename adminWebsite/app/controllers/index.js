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
  });
};

//Change variable name "item" into "product"
domId("addBtn").onclick = () => {
  domId("QL").reset();
  domId("id").disabled = false;
  domId("modalTitle").innerHTML = "Thêm sản phẩm";
  domId("modal-footer").innerHTML = `
  <button type="button" class="btn btn-secondary close-btn" data-dismiss="modal">Đóng</button>
  <button type="button" class="btn btn-success" onclick="addProduct()">Thêm</button></button>`;
};

window.addProduct = () => {
  let id = domId("id").value;
  let name = domId("name").value;
  let price = domId("price").value;
  let screen = domId("screen").value;
  let backCamera = domId("backCamera").value;
  let frontCamera = domId("frontCamera").value;
  let img = domId("img").value;
  let desc = domId("desc").value;
  let type = domId("type").value;

  let product = new Product(
    id,
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
  getProductList();
};

function renderProductList(data = productList) {
  //changed "for" loop to higher order function for cleaner code
  let html = data.reduce((total, element) => {
    total += `<tr>
    <td>${element.id}</td>
    <td>${element.name}</td>
    <td>$ ${element.price}</td>
    <td>${element.img}</td>
    <td>${element.desc}</td>
    <td>
    <button onclick="getUpdateForm('${element.id}')" class="btn btn-warning" data-toggle="modal" data-target="#exampleModal">Sửa</button>
    <button onclick="deleteProduct('${element.id}')" class="btn btn-danger">Xóa</button>
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

  domId("modal-footer").innerHTML = `
  <button type="button" class="btn btn-secondary close-btn" data-dismiss="modal">Đóng</button>
  <button type="button" class="btn btn-primary" onclick="updateProduct(${id})">Cập nhật</button></button>`;
  domId("id").disabled = true; // nguoi dung khong sua dc id

  // var index = findData(id);
  // if (index === -1) {
  //   alert("không tìm thấy id phù hợp");
  //   return;
  // }
  productService.getProductbyId(id).then((response) => {
    const selectedProduct = response.data;
    domId("id").value = selectedProduct.id;
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
  let name = domId("name").value;
  let price = domId("price").value;
  let screen = domId("screen").value;
  let backCamera = domId("backCamera").value;
  let frontCamera = domId("frontCamera").value;
  let img = domId("img").value;
  let desc = domId("desc").value;
  let type = domId("type").value;

  let product = new Product(
    id,
    name,
    price,
    screen,
    backCamera,
    frontCamera,
    img,
    desc,
    type
  );

  productService.updateProduct(id, product).then(() => {
    document.querySelector(".close-btn").click();
    alert("Cập nhật thành công");
    getProductList();
  });

  domId("QL").reset(); // reset form
  domId("id").disabled = false;
};

window.searchItem = () => {
  const result = [];
  const keyword = domId("searchName").value;

  const idRegex = /\d+/;
  const nameRegex = /^[A-Za-z]/;

  for (let i in productList) {
    const id = productList[i].id;
    const name = productList[i].name;
    if (idRegex.test(keyword) && id.includes(keyword)) {
      result.push(productList[i]);
    } else if (
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

//validate stuff

window.onload = () => {
  getProductList();
};
