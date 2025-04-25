// FAQ Accordion
const faqQuestions = document.querySelectorAll('.faq-question');
faqQuestions.forEach(btn => {
    btn.addEventListener('click', function() {
        const item = this.parentElement;
        item.classList.toggle('active');
        // Close others
        document.querySelectorAll('.faq-item').forEach(other => {
            if (other !== item) other.classList.remove('active');
        });
    });
});

// Contact Form Feedback
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const feedback = document.getElementById('formFeedback');
        feedback.textContent = 'Thank you for contacting us! We will get back to you soon.';
        feedback.style.color = '#1976d2';
        contactForm.reset();
    });
}

// Home page highlight box interactivity
const highlights = document.querySelectorAll('.highlight-box');
highlights.forEach(box => {
    box.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            box.classList.toggle('active-highlight');
        }
    });
    box.addEventListener('click', function() {
        box.classList.toggle('active-highlight');
    });
});

// Hamburger menu for nav on small screens
const nav = document.querySelector('nav');
if (nav) {
    let hamburger = document.querySelector('.hamburger');
    let navUl = nav.querySelector('ul');
    if (!hamburger) {
        hamburger = document.createElement('button');
        hamburger.className = 'hamburger';
        hamburger.setAttribute('aria-label', 'Open navigation menu');
        hamburger.innerHTML = '<span></span><span></span><span></span>';
        nav.insertBefore(hamburger, navUl);
    }
    hamburger.onclick = function() {
        navUl.classList.toggle('show');
        hamburger.setAttribute('aria-expanded', navUl.classList.contains('show'));
    };
    // Hide menu on link click (for single page feel)
    navUl.querySelectorAll('a').forEach(link => {
        link.onclick = () => {
            if (window.innerWidth <= 700) navUl.classList.remove('show');
        };
    });
    // Hide menu on outside click
    document.addEventListener('click', function(e) {
        if (window.innerWidth <= 700 && navUl.classList.contains('show')) {
            if (!nav.contains(e.target)) navUl.classList.remove('show');
        }
    });
}

// See Our Products button interactivity
const seeBtn = document.querySelector('.see-products-btn');
if (seeBtn) {
    seeBtn.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            seeBtn.classList.add('see-products-btn-active');
        }
    });
    seeBtn.addEventListener('blur', function() {
        seeBtn.classList.remove('see-products-btn-active');
    });
    seeBtn.addEventListener('mousedown', function() {
        seeBtn.classList.add('see-products-btn-active');
    });
    seeBtn.addEventListener('mouseup', function() {
        seeBtn.classList.remove('see-products-btn-active');
    });
}

// --- Order Modal Logic for Products Page ---
const orderNowBtn = document.getElementById('orderNowBtn');
const orderModal = document.getElementById('order-modal');
const orderModalClose = document.getElementById('orderModalClose');
const orderProductsList = document.getElementById('orderProductsList');
const orderForm = document.getElementById('orderForm');

// Define products here or dynamically extract from .product-card if present
const productData = [
  {
    name: 'All-Purpose Cleaner',
    price: 6.99,
    img: 'https://via.placeholder.com/120x120?text=Cleaner',
    id: 'prod1'
  },
  {
    name: 'Glass & Surface Spray',
    price: 5.49,
    img: 'https://via.placeholder.com/120x120?text=Glass',
    id: 'prod2'
  },
  {
    name: 'Disinfectant Wipes',
    price: 7.99,
    img: 'https://via.placeholder.com/120x120?text=Wipes',
    id: 'prod3'
  },
  {
    name: 'Floor Cleaner',
    price: 8.99,
    img: 'https://via.placeholder.com/120x120?text=Floor',
    id: 'prod4'
  }
];

function renderOrderProducts() {
  orderProductsList.innerHTML = '';
  productData.forEach((prod, idx) => {
    const prodDiv = document.createElement('div');
    prodDiv.className = 'order-product-item';
    prodDiv.innerHTML = `
      <img src="${prod.img}" alt="${prod.name}" class="order-product-img" />
      <span class="order-product-name">${prod.name}</span>
      <span class="order-product-price">$${prod.price.toFixed(2)}</span>
      <div class="order-qty-controls">
        <button type="button" class="order-qty-btn" data-action="sub" data-idx="${idx}">-</button>
        <span class="order-qty-val" id="orderQty${idx}">0</span>
        <button type="button" class="order-qty-btn" data-action="add" data-idx="${idx}">+</button>
      </div>
    `;
    orderProductsList.appendChild(prodDiv);
  });
}

let orderQuantities = Array(productData.length).fill(0);

function updateQtyDisplay(idx) {
  document.getElementById(`orderQty${idx}`).textContent = orderQuantities[idx];
}

if (orderNowBtn && orderModal && orderModalClose && orderProductsList) {
  orderNowBtn.onclick = () => {
    renderOrderProducts();
    orderModal.style.display = 'block';
    orderQuantities = Array(productData.length).fill(0);
    for (let i = 0; i < productData.length; ++i) updateQtyDisplay(i);
  };
  orderModalClose.onclick = () => {
    orderModal.style.display = 'none';
  };
  window.onclick = (e) => {
    if (e.target === orderModal) orderModal.style.display = 'none';
  };
  orderProductsList.onclick = (e) => {
    if (e.target.classList.contains('order-qty-btn')) {
      const idx = +e.target.getAttribute('data-idx');
      const action = e.target.getAttribute('data-action');
      if (action === 'add') orderQuantities[idx]++;
      if (action === 'sub' && orderQuantities[idx] > 0) orderQuantities[idx]--;
      updateQtyDisplay(idx);
    }
  };
}

if (orderForm) {
  orderForm.onsubmit = async function(e) {
    e.preventDefault();
    const name = document.getElementById('orderName').value.trim();
    const contact = document.getElementById('orderContact').value.trim();
    const products = {};
    productData.forEach((prod, idx) => {
      products[prod.name] = {
        quantity: orderQuantities[idx],
        price: prod.price
      };
    });
    // Only submit if at least one product is ordered
    if (Object.values(products).every(p => p.quantity === 0)) {
      alert('Please select at least one product to order.');
      return;
    }
    try {
      const res = await fetch('http://localhost:3001/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, contact, products })
      });
      const data = await res.json();
      if (data.success) {
        alert('Order submitted successfully!');
        orderModal.style.display = 'none';
        orderForm.reset();
      } else {
        alert('Order failed: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      alert('Could not submit order. Please try again later.');
    }
  };
}
