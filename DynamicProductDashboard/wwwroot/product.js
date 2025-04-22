const productList = document.getElementById("productList");
const loadBtn = document.getElementById("loadProductsButton");
const form = document.getElementById("productForm");
const searchInput = document.getElementById("searchInput");

const prevBtn = document.getElementById("prevPage");
const nextBtn = document.getElementById("nextPage");
const pageIndicator = document.getElementById("pageIndicator");

let allProducts = [];
let currentPage = 1;
const pageSize = 5;

loadBtn.addEventListener("click", loadProducts);
form.addEventListener("submit", addProduct);
searchInput.addEventListener("input", debounce(searchProducts, 500));
prevBtn.addEventListener("click", () => changePage(-1));
nextBtn.addEventListener("click", () => changePage(1));

async function loadProducts() {
    try {
        const res = await fetch("https://jsonplaceholder.typicode.com/posts");
        const data = await res.json();
        allProducts = data;
        currentPage = 1;
        displayPage();
    } catch (err) {
        alert("Failed to load products");
    }
}


async function addProduct(e) {
    e.preventDefault();
    const title = document.getElementById("title").value;
    const body = document.getElementById("body").value;

    if (!title || !body) return alert("Title and description are required.");

    try {
        const response = await fetch("https://jsonplaceholder.typicode.com/posts", {
            method: "POST",
            body: JSON.stringify({ title, body, userId: 1 }),
            headers: { "Content-type": "application/json" }
        });

        if (!response.ok) throw new Error("Add failed");

        const newProduct = await response.json();

        allProducts.unshift(newProduct); 

        alert("Product added!");
        displayPage(); 
        form.reset(); 
    } catch (error) {
        alert("Error adding product: " + error.message);
    }
}


async function editProduct(id) {
    const newTitle = prompt("Enter new title:");
    const newBody = prompt("Enter new body:");

    if (!newTitle || !newBody) return alert("Title and body are required.");

    try {
        const response = await fetch(`https://jsonplaceholder.typicode.com/posts/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, title: newTitle, body: newBody, userId: 1 })
        });

        if (!response.ok) throw new Error("Update failed");

     
        allProducts = allProducts.map(product =>
            product.id === id ? { ...product, title: newTitle, body: newBody } : product
        );

        alert("Product updated!");
        displayPage();
    } catch (error) {
        alert("Error updating product: " + error.message);
    }
}


async function deleteProduct(id) {
    try {
        const response = await fetch(`https://jsonplaceholder.typicode.com/posts/${id}`, {
            method: "DELETE"
        });

        if (!response.ok) throw new Error("Delete failed");

   
        allProducts = allProducts.filter(product => product.id !== id);

        alert("Product deleted!");

 
        displayPage();
    } catch (error) {
        alert("Error deleting product: " + error.message);
    }
}


async function searchProducts() {
    const query = searchInput.value.trim();

    try {
        const res = await fetch(`https://jsonplaceholder.typicode.com/posts?q=${query}`);
        const data = await res.json();
        allProducts = data;
        currentPage = 1;
        displayPage(); 
    } catch (err) {
        alert("Search failed");
    }
}


function displayProducts(products) {
    productList.innerHTML = "";
    products.forEach(product => {
        productList.innerHTML += `
            <div class="product">
                <h3>${product.title}</h3>
                <p>${product.body}</p>
                <button onclick="editProduct(${product.id})">Edit</button>
                <button onclick="deleteProduct(${product.id})">Delete</button>
            </div>
        `;
    });
}

function debounce(func, delay) {
    let timeout;
    return () => {
        clearTimeout(timeout);
        timeout = setTimeout(func, delay);
    };
}


function displayPage() {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    const pageData = allProducts.slice(start, end);
    displayProducts(pageData);
    pageIndicator.textContent = `Page ${currentPage}`;
}

function changePage(direction) {
    const maxPage = Math.ceil(allProducts.length / pageSize);
    if (currentPage + direction >= 1 && currentPage + direction <= maxPage) {
        currentPage += direction;
        displayPage();
    }
}
