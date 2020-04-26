//Variables

const cartBtn = document.querySelector('.cart-btn');
const closeCartBtn = document.querySelector('.close-cart');
const clearCart = document.querySelector('.clear-cart');
const cartDom = document.querySelector('.cart');
const cartOverlay = document.querySelector('.cart-overlay');
const cartItems = document.querySelector('.cart-items');
const cartTotal = document.querySelector('.cart-total');
const cartContent = document.querySelector('.cart-content');
const productsDom = document.querySelector('.products-center');


//Cart

let cart = [];

//Buttons
let buttonsDOM = [];

//Products
class Products{
    async getProducts(){
        try{
            let result = await fetch('main.json');
            let data = await result.json();
            let products = data.items;
            products = products.map(items => {
                const {title,price} = items.fields;
                const {id} = items.sys;
                const img = items.fields.image.fields.file.url;
                return {title,price,id,img};
            });
            return products;
        }catch (error){
            console.log(error);
        }
    }
}

//UI
class UI{
    displayProducts(products){
        console.log(products);

        let result = '';
        products.forEach(product => {
            result += `<!-- single product -->
                         <article class="product">
                          <div class="img-container">
                           <img
                              src=${product.img}
                                alt="product"
                                 class="product-img"
                            />
                         <button class="bag-btn" data-id=${product.id}>
                     <i class="fas fa-shopping-cart"></i>
                     add to bag
                     </button>
                </div>

          <h3>${product.title}</h3>
          <h4>$${product.price}</h4>
        </article>
        <!-- end of single product -->`;
        });
        productsDom.innerHTML = result;
    }
    getBagBtns(){
        const buttons = [...document.querySelectorAll(".bag-btn")];
        buttonsDOM = buttons;
        buttons.forEach(button => {
            let id =  button.dataset.id;
            let inCart = cart.find(item => item.id ===id);
            if(inCart){
                button.innerText = "In Cart";
                button.disabled = true
            }
            
                button.addEventListener('click',(event)=>{
                    event.target.innerText = "In Cart";
                    event.target.disabled = true;
                    let cartItem = {...Storage.getProducts(id),amount:1};
                    cart = [...cart,cartItem];
                    
                    Storage.saveCart(cart);

                    this.setCartValues(cart);

                    this.addCartItem(cartItem);
                    
                    this.showCart();

                    

                }
                );
            
        });
    }
    setCartValues(cart){
        let tempTotal = 0;
        let itemsTotal = 0;
        cart.map(item => {
            tempTotal += item.price * item.amount;
            itemsTotal += item.amount;
        });
        cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
        cartItems.innerText = itemsTotal;
        }

    addCartItem(item){
        const div = document.createElement('div');
        div.classList.add('cart-item');
        div.innerHTML = ` <img src=${item.img} alt="product" />
        <div>
          <h4>${item.title}</h4>
          <h5>$${item.price}</h5>
          <span class="remove-item" data-id=${item.id}>remove</span>
        </div>
        <div>
              <i class="fas fa-chevron-up" data-id=${item.id}></i>
              <p class="item-amount">
                ${item.amount}
              </p>
              <i class="fas fa-chevron-down" data-id=${item.id}></i>
            </div>`;
            cartContent.appendChild(div);
            
        }        

        showCart(){
            cartOverlay.classList.add('transparentBcg');
            cartDom.classList.add('showCart');
            
        }

        setupApp(){
            cart = Storage.getCart();
            this.setCartValues(cart);
            this.populate(cart);
        }

        populate(){
            cart.forEach(item =>this.addCartItem(item));
        }

        cartLogic(){
            clearCart.addEventListener('click',() => {
                this.clearCart();
            });

            cartContent.addEventListener('click',event => {
                if(event.target.classList.contains('remove-item')){
                    let removeItem = event.target;
                    let id = removeItem.dataset.id;
                    this.removeItem(id);
                    cartContent.removeChild(removeItem.parentElement.parentElement);
                }
                else if(event.target.classList.contains('fa-chevron-up')){
                    let addAmnt = event.target;
                    let id = addAmnt.dataset.id;
                    let tempItem = cart.find(item => item.id === id);
                    tempItem.amount = tempItem.amount + 1;
                    Storage.saveCart(cart);
                    this.setCartValues(cart);
                    console.log(tempItem.amount);
                    
                    addAmnt.nextElementSibling.innerText = tempItem.amount;
                    
                }

                else if(event.target.classList.contains('fa-chevron-down')){
                    let decAmnt = event.target;
                    
                    let id = decAmnt.dataset.id;
                    let tempItem = cart.find(item => item.id === id);
                    
                    tempItem.amount = tempItem.amount - 1;
                    Storage.saveCart(cart);
                    this.setCartValues(cart);
                    if(tempItem.amount === 0 ){
                        
                        cartContent.removeChild(decAmnt.parentElement.parentElement);
                        this.removeItem(id);
                    }
                    
                    else{
                        addAmnt.previousElementSibling.innerText = tempItem.amount;
                    }
                    
                }
            });
        }
        clearCart(){
            let cartItems = cart.map(item => item.id);
            cartItems.forEach(id => this.removeItem(id))
            while(cartContent.children.length > 0){
                cartContent.removeChild(cartContent.children[0]);
                this.hideCart();
                
                
            }
        }

        removeItem(id){
            cart = cart.filter(item => item.id !== id);
            this.setCartValues(cart);
            Storage.saveCart(cart);
            let button = this.getSingleButton(id);
            button.disabled = false;
            button.innerHTML = `<i class="fas fa=fa-shopppiing-cart"></i>add to bag`;
        }
        getSingleButton(id){
            return buttonsDOM.find(button => button.dataset.id ===id);
        }

        hideCart(){
            cartOverlay.classList.remove('transparentBcg');
            cartDom.classList.remove('showCart');
        }
}

//local storage
class Storage{
    static saveProduct(products){
        localStorage.setItem("product",JSON.stringify(products));
    };
    static getProducts(id){
        let products = JSON.parse(localStorage.getItem('product'));
        return products.find(product => product.id === id);
    };
    static saveCart(cart){
        localStorage.setItem("cart",JSON.stringify(cart));
    };
    static getCart(){
        return localStorage.getItem('cart')?JSON.parse(localStorage.getItem('cart')):[];

    }

}



document.addEventListener("DOMContentLoaded", ()=>{
    const ui =new UI();
    const products = new Products();
    ui.setupApp();
    ui.cartLogic();

    products.getProducts().then(products => {
        ui.displayProducts(products);
        Storage.saveProduct(products);
    }).then(()=>{
        ui.getBagBtns();

    });
    closeCartBtn.addEventListener('click',() =>{
        cartOverlay.classList.remove('transparentBcg');
            cartDom.classList.remove('showCart');
    });

    cartBtn.addEventListener('click',() =>{
        cartOverlay.classList.add('transparentBcg');
            cartDom.classList.add('showCart');
    });

});

