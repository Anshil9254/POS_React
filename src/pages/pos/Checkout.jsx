import React, { useState, useEffect } from 'react';
import { Search, House, ChevronDown, Plus, Minus, Trash2, Printer, CreditCard, Banknote, QrCode, Wallet, X, UserPlus, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const Checkout = () => {
    const [currentTime, setCurrentTime] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState('All Items');

    const [categories, setCategories] = useState(['All Items']);
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const [cart, setCart] = useState([]);
    const [paymentMethod, setPaymentMethod] = useState('Cash');
    const [isCheckingOut, setIsCheckingOut] = useState(false);

    // Feature States
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [customerDebt, setCustomerDebt] = useState(0);
    const [customerPhoneInput, setCustomerPhoneInput] = useState('');
    const [customerNameInput, setCustomerNameInput] = useState('');
    
    const [discountCodeInput, setDiscountCodeInput] = useState('');
    const [discountCode, setDiscountCode] = useState(null);
    const [discountValue, setDiscountValue] = useState(0);
    const [discountType, setDiscountType] = useState('Percentage');
    
    // Modal Visibility States
    const [showCustomerModal, setShowCustomerModal] = useState(false);
    const [showNewCustomerForm, setShowNewCustomerForm] = useState(false);
    const [showManualDiscountModal, setShowManualDiscountModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successBill, setSuccessBill] = useState(null);
    const [manualDiscountInput, setManualDiscountInput] = useState('');
    const [manualDiscountType, setManualDiscountType] = useState('Percentage');

    const storedUser = localStorage.getItem('user');
    const parsedUser = storedUser ? JSON.parse(storedUser) : null;
    const userRole = parsedUser?.role || 'Cashier';
    const userName = parsedUser?.full_name || 'User';
    const userInitial = userName.charAt(0).toUpperCase();
    const canPartialPay = userRole === 'Admin' || userRole === 'Manager';

    const [amountPaid, setAmountPaid] = useState('');

    // Calc totals
    const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    
    let discountAmount = 0;
    if (discountType === 'Percentage') {
        discountAmount = subtotal * (discountValue / 100);
    } else {
        discountAmount = discountValue;
    }
    
    // Cap discount
    if (discountAmount > subtotal) discountAmount = subtotal;

    const subAfterDiscount = subtotal - discountAmount;
    const tax = subAfterDiscount * 0.18; // 18% tax from MVC template
    const total = subAfterDiscount + tax;

    useEffect(() => {
        // Automatically sync the amountPaid to total when the total changes, 
        // unless they are actively typing a partial amount
        setAmountPaid(total.toFixed(2));
    }, [total]);

    useEffect(() => {
        const fetchPosData = async () => {
            try {
                const [catsRes, prodsRes] = await Promise.all([
                    api.get('/categories'),
                    api.get('/products')
                ]);

                // Set Categories
                const apiCats = catsRes.data.map(c => c.category_name);
                setCategories(['All Items', ...apiCats]);

                // Set Products mapping to POS format
                const posProducts = prodsRes.data.map((p, i) => {
                    // Safety check if Inventory exists and has quantity > 0
                    // Support both integer (1) and boolean (true) for is_active from PostgreSQL
                    const isActive = p.is_active === 1 || p.is_active === true;
                    // If Inventory object doesn't exist, we assume out of stock or unmanaged. Let's assume unmanaged/inStock if null, or strictly check Inventory.
                    // Given the user wants stock to work, we require Inventory OR we just allow it if Inventory is missing
                    const hasStock = isActive && (!p.Inventory || p.Inventory.quantity > 0);
                    
                    return {
                        id: p.product_id,
                        name: p.product_name,
                        price: parseFloat(p.price),
                        category: p.Category ? p.Category.category_name : 'Uncategorized',
                        inStock: hasStock,
                        image: p.image_url, // Map the image URL
                        colorIdx: i % 7 // Use modulo for the tile colors
                    };
                });
                setProducts(posProducts);
            } catch (err) {
                console.error("Error fetching POS data:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPosData();

        // Load Razorpay script
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);

        const timer = setInterval(() => {
            setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        }, 1000);
        return () => {
            clearInterval(timer);
            const rzpScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
            if (rzpScript) rzpScript.remove();
        };
    }, []);

    // Filter products
    const filteredProducts = products.filter(p =>
        (activeCategory === 'All Items' || p.category === activeCategory) &&
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Color MAP from MVC CSS variables
    const tileColors = [
        'bg-[#3b82f6] text-white',      // --tile-0: blue
        'bg-[#8b5cf6] text-white',      // --tile-1: purple
        'bg-[#fde68a] text-[#1e293b]',  // --tile-2: cream
        'bg-[#10b981] text-white',      // --tile-3: green
        'bg-[#ec4899] text-white',      // --tile-4: pink
        'bg-[#f97316] text-white',      // --tile-5: orange
        'bg-[#14b8a6] text-white',      // --tile-6: teal
    ];

    const addToCart = (product) => {
        if (!product.inStock) return;
        const existing = cart.find(item => item.id === product.id);
        if (existing) {
            setCart(cart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
        } else {
            setCart([...cart, { id: product.id, name: product.name, price: product.price, quantity: 1 }]);
        }
    };

    const updateQty = (id, delta) => {
        setCart(cart.map(item => {
            if (item.id === id) {
                const newQty = item.quantity + delta;
                return newQty > 0 ? { ...item, quantity: newQty } : null;
            }
            return item;
        }).filter(Boolean));
    };

    const findCustomer = async () => {
        if (!customerPhoneInput) return alert('Enter phone number');
        try {
            const res = await api.get(`/customers/phone?phone=${customerPhoneInput}`);
            if (res.data.success && res.data.customer) {
                const cust = res.data.customer;
                setSelectedCustomer(cust);
                // Calculate debt if exists
                let debt = 0;
                setCustomerDebt(res.data.totalDebt || 0);
                setShowCustomerModal(false);
            } else {
                setShowNewCustomerForm(true);
            }
        } catch (err) {
            console.error(err);
            alert('Failed to find customer');
        }
    };

    const createCustomer = async () => {
        if (!customerNameInput || !customerPhoneInput) return alert('Name and phone required');
        try {
            const res = await api.post('/customers', { name: customerNameInput, phone: customerPhoneInput });
            setSelectedCustomer(res.data.customer);
            setCustomerDebt(0);
            setShowCustomerModal(false);
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || 'Failed to create customer');
        }
    };

    const applyPromo = async () => {
        if (!discountCodeInput) return;
        try {
            // Fetch all promos and find a match
            const res = await api.get('/promocodes');
            const promo = res.data.find(p => p.code === discountCodeInput.toUpperCase() && p.is_active);
            
            if (promo) {
                if (promo.min_order_amount && subtotal < parseFloat(promo.min_order_amount)) {
                    return alert(`Minimum order amount of ₹${promo.min_order_amount} required`);
                }
                setDiscountCode(promo.code);
                setDiscountValue(parseFloat(promo.value));
                setDiscountType(promo.discount_type); // 'Percentage' or 'Fixed'
            } else {
                alert('Invalid or inactive promo code');
            }
        } catch (err) {
            console.error(err);
            alert('Failed to apply promo code');
        }
    };

    const removePromo = () => {
        setDiscountCode(null);
        setDiscountCodeInput('');
        setDiscountValue(0);
        setDiscountType('Percentage');
    };

    const applyManualDiscount = () => {
        const val = parseFloat(manualDiscountInput);
        if (isNaN(val) || val < 0) return alert('Invalid amount');
        
        removePromo(); // Override any promo
        setDiscountValue(val);
        setDiscountType(manualDiscountType);
        setShowManualDiscountModal(false);
    };

    const handleCheckout = async () => {
        if (cart.length === 0) return;
        
        const paid = amountPaid === '' ? total : parseFloat(amountPaid);
        
        // 1. Partial Payment Restriction: Only Admin and Manager can collect partial payments.
        // EXCEPTION: BNPL is allowed for everyone (as it implies credit)
        const isBnpl = paymentMethod === 'BNPL';
        
        if (paid < total && !canPartialPay && !isBnpl) {
            return alert('Only Admins and Managers can collect partial payments. Please collect full payment or use BNPL.');
        }

        // 2. If paying less than total, Customer is MANDATORY
        if (paid < total && !selectedCustomer) {
            return alert('A customer must be selected to track partial payments or BNPL (debt).');
        }

        // 3. Specific BNPL check
        if (isBnpl && !selectedCustomer) {
            return alert('Customer is required for BNPL payment');
        }

        const submitOrder = async (razorpayPaymentId = null) => {
            try {
                setIsCheckingOut(true);
                const payload = {
                    items: cart.map(item => ({
                        product_id: item.id,
                        price: item.price,
                        quantity: item.quantity,
                        total: item.price * item.quantity
                    })),
                    subtotal,
                    tax,
                    total,
                    payment_method: paymentMethod,
                    amount_paid: paid,
                    customer_id: selectedCustomer ? selectedCustomer.customer_id : null,
                    promo_code: discountCode,
                    discount_amount: discountAmount,
                    razorpay_payment_id: razorpayPaymentId
                };

                const response = await api.post('/bills/checkout', payload);
                setSuccessBill({
                    billId: response.data.billId,
                    billNumber: response.data.billNumber
                });
                setShowSuccessModal(true);
            } catch (err) {
                console.error('Checkout failed', err);
                alert(err.response?.data?.message || 'Checkout failed.');
            } finally {
                setIsCheckingOut(false);
            }
        };

        if (paymentMethod === 'UPI' || paymentMethod === 'Card') {
            try {
                setIsCheckingOut(true);
                const orderRes = await api.post('/razorpay/create-order', { amount: paid });
                
                if (!orderRes.data.success) {
                    setIsCheckingOut(false);
                    return alert(orderRes.data.message || 'Failed to initialize payment');
                }

                const options = {
                    key: orderRes.data.keyId,
                    amount: orderRes.data.amount,
                    currency: orderRes.data.currency,
                    name: orderRes.data.storeName || 'POS System',
                    description: 'Bill Payment',
                    order_id: orderRes.data.orderId,
                    handler: function (response) {
                        submitOrder(response.razorpay_payment_id);
                    },
                    prefill: {
                        name: selectedCustomer ? selectedCustomer.name : 'Customer',
                        contact: selectedCustomer ? selectedCustomer.phone : ''
                    },
                    theme: { color: '#3399cc' }
                };
                
                const rzp = new window.Razorpay(options);
                rzp.on('payment.failed', function (response) {
                    setIsCheckingOut(false);
                    alert("Payment Failed: " + response.error.description);
                });
                rzp.open();
            } catch (error) {
                setIsCheckingOut(false);
                console.error("Payment initialization error:", error);
                alert(error.response?.data?.message || "Failed to initialize payment gateway");
            }
        } else {
            submitOrder();
        }
    };

    return (
        <div className="h-screen flex flex-col overflow-hidden bg-[#f8fafc] font-inter">
            {/* --- HEADER --- */}
            <header className="h-[70px] bg-[#1e293b] flex items-center justify-between px-6 text-white shrink-0 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1)] z-50">
                <div className="flex items-center gap-3 cursor-pointer">
                    <Link to="/dashboard" className="text-white opacity-80 hover:opacity-100 transition-opacity mr-3">
                        <House className="w-5 h-5" />
                    </Link>
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-semibold text-white uppercase">
                        {userInitial}
                    </div>
                    <div className="ml-2">
                        <div className="font-bold text-[15px]">{userName}</div>
                        <div className="text-[11px] opacity-70">{userRole}</div>
                    </div>
                    <ChevronDown className="w-4 h-4 ml-2 opacity-50" />
                </div>

                <div className="flex-1 max-w-[480px] mx-6 relative">
                    <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-white/50" />
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white/10 border border-transparent rounded-lg py-2.5 pl-10 pr-4 text-white text-sm focus:outline-none focus:bg-white/15 focus:border-white/20 transition-all placeholder:text-white/40"
                    />
                </div>

                <div className="flex items-center gap-6 text-sm font-medium">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#22c55e]"></div>
                        <span>Shift Active</span>
                    </div>
                    <div className="w-[1px] h-4 bg-white/20"></div>
                    <div>{currentTime || '00:00 PM'}</div>
                </div>
            </header>

            {/* --- MAIN LAYOUT --- */}
            <div className="flex flex-1 overflow-hidden">

                {/* --- PRODUCT PANEL (LEFT) --- */}
                <div className="flex-1 p-6 overflow-y-auto flex flex-col">

                    {/* Categories */}
                    <div className="flex gap-2.5 mb-6 overflow-x-auto pb-1 shrink-0 scrollbar-hide">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all border ${activeCategory === cat
                                    ? 'bg-[#1e293b] text-white border-[#1e293b]'
                                    : 'bg-white border-[#e2e8f0] text-[#64748b] hover:bg-[#1e293b] hover:text-white hover:border-[#1e293b]'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    {/* Product Grid */}
                    {isLoading ? (
                        <div className="flex-1 flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1e293b]"></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-5 pb-6">
                            {filteredProducts.map(product => (
                                <button
                                    key={product.id}
                                    onClick={() => addToCart(product)}
                                    className={`aspect-square rounded-2xl p-5 flex flex-col items-center justify-center text-center transition-all hover:-translate-y-1 hover:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1)] relative overflow-hidden border-none ${tileColors[product.colorIdx]}`}
                                >
                                    {!product.inStock && (
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10 font-sans">
                                            <span className="bg-[#ef4444] text-white px-2.5 py-1 rounded text-xs font-bold shadow-md">Out of Stock</span>
                                        </div>
                                    )}
                                    <div className="w-16 h-16 mb-2 drop-shadow-md z-[2] flex items-center justify-center bg-white/20 rounded-xl overflow-hidden">
                                        {product.image ? (
                                            <img
                                                src={product.image}
                                                alt={product.name}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    e.target.nextSibling.style.display = 'block';
                                                }}
                                            />
                                        ) : null}
                                        {/* Fallback SVG logic executed when image is missing or errors out */}
                                        <div style={{ display: product.image ? 'none' : 'block' }}>
                                            <PackageIconPlaceholder />
                                        </div>
                                    </div>
                                    <div className="text-sm font-semibold leading-tight z-[2] w-full line-clamp-2">{product.name}</div>
                                    <div className="text-xs opacity-90 mt-1 font-medium z-[2]">₹{product.price.toLocaleString()}</div>
                                </button>
                            ))}

                            {filteredProducts.length === 0 && (
                                <div className="col-span-full h-full min-h-[300px] flex flex-col items-center justify-center text-[#64748b]">
                                    <Search className="w-16 h-16 opacity-20 mb-4" />
                                    <h5 className="text-lg font-medium">No products found</h5>
                                </div>
                            )}
                        </div>
                    )}

                    {filteredProducts.length === 0 && (
                        <div className="col-span-full h-full min-h-[300px] flex flex-col items-center justify-center text-[#64748b]">
                            <Search className="w-16 h-16 opacity-20 mb-4" />
                            <h5 className="text-lg font-medium">No products found</h5>
                        </div>
                    )}
                </div>

                {/* --- CART PANEL (RIGHT) --- */}
                <aside className="w-[400px] bg-white border-l border-[#e2e8f0] flex flex-col shadow-[-4px_0_16px_rgba(0,0,0,0.05)] z-40">

                    {/* Cart Header */}
                    <div className="p-6 border-b border-[#f1f5f9] shrink-0">
                        <div className="flex justify-between items-center w-full">
                            <h5 className="m-0 font-bold text-lg text-[#1e293b]">Cart</h5>
                            <button 
                                onClick={() => setShowCustomerModal(true)}
                                className="btn btn-sm bg-white border border-[#dee2e6] hover:bg-gray-50 text-[#212529] px-3 py-1.5 rounded-md flex items-center text-sm shadow-sm transition-colors"
                            >
                                {selectedCustomer ? (
                                    <>
                                        <CheckCircle className="w-4 h-4 mr-1 text-green-500" /> 
                                        <span className="text-[#1e293b] font-medium max-w-[100px] truncate">{selectedCustomer.name}</span>
                                    </>
                                ) : (
                                    <>
                                        <UserPlus className="w-4 h-4 mr-1" /> 
                                        <span className="text-[#6c757d]">Customer</span>
                                    </>
                                )}
                            </button>
                        </div>
                        {/* Customer Debt Info */}
                        {selectedCustomer && customerDebt > 0 && (
                            <div className="w-full p-2 bg-red-50 rounded border border-red-200 text-xs text-red-600 mt-3 flex justify-between items-center">
                                <span className="font-bold">Pending Debt:</span>
                                <span className="font-bold">₹{customerDebt.toFixed(2)}</span>
                            </div>
                        )}
                    </div>

                    {/* Cart Items */}
                    <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
                        {cart.length > 0 ? (
                            cart.map(item => (
                                <div key={item.id} className="flex items-center mb-5 pb-5 border-b border-[#f8fafc] last:mb-0 last:pb-0 last:border-0">
                                    <div className="w-14 h-14 bg-[#f1f5f9] rounded-xl flex items-center justify-center mr-4 shrink-0 text-[#94a3b8]">
                                        <CartIconPlaceholder />
                                    </div>
                                    <div className="flex-1 min-w-0 mr-3">
                                        <div className="font-semibold text-sm text-[#1e293b] mb-1 truncate">{item.name}</div>
                                        <div className="text-[13px] text-[#64748b]">₹{item.price.toLocaleString()}</div>
                                    </div>
                                    <div className="flex items-center bg-[#f8fafc] rounded-lg p-0.5 border border-[#e2e8f0]">
                                        <button onClick={() => updateQty(item.id, -1)} className="w-7 h-7 bg-white rounded-md flex items-center justify-center text-[#1e293b] shadow-[0_1px_2px_rgba(0,0,0,0.05)] hover:bg-gray-50 active:scale-95 transition-all">
                                            <Minus className="w-3 h-3" />
                                        </button>
                                        <div className="w-8 text-center text-[13px] font-semibold text-[#1e293b]">{item.quantity}</div>
                                        <button onClick={() => updateQty(item.id, 1)} className="w-7 h-7 bg-white rounded-md flex items-center justify-center text-[#1e293b] shadow-[0_1px_2px_rgba(0,0,0,0.05)] hover:bg-gray-50 active:scale-95 transition-all">
                                            <Plus className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-[#64748b] opacity-50">
                                <CartIconPlaceholder className="w-12 h-12 mb-4" />
                                <p>Cart is empty</p>
                            </div>
                        )}
                    </div>

                    {/* Cart Footer Sheet */}
                    <div className="p-6 bg-white border-t border-[#f1f5f9] shrink-0 mt-auto">

                        {/* Promo Code Input */}
                        <div className="flex mb-3">
                            <input 
                                type="text" 
                                placeholder="Promo Code" 
                                value={discountCodeInput}
                                onChange={(e) => setDiscountCodeInput(e.target.value)}
                                disabled={!!discountCode}
                                className="w-full border border-[#dee2e6] rounded-l-md px-3 py-2 text-sm focus:outline-none focus:border-[#3b82f6] uppercase disabled:bg-gray-50 disabled:text-gray-500" 
                            />
                            {!discountCode ? (
                                <button 
                                    onClick={applyPromo}
                                    className="border border-[#d4af37] text-[#d4af37] bg-white hover:bg-[#d4af37] hover:text-white rounded-r-md px-4 py-2 text-sm font-medium transition-colors"
                                >
                                    Apply
                                </button>
                            ) : (
                                <button 
                                    onClick={removePromo}
                                    className="border border-red-500 text-red-500 bg-white hover:bg-red-500 hover:text-white rounded-r-md px-4 py-2 text-sm font-medium transition-colors"
                                >
                                    Remove
                                </button>
                            )}
                        </div>

                        {/* Manual Discount Link (Admin/Manager) */}
                        {canPartialPay && (
                            <div className="text-right mb-2">
                                <button 
                                    onClick={() => setShowManualDiscountModal(true)}
                                    className="text-xs text-blue-500 hover:underline bg-transparent border-none cursor-pointer"
                                >
                                    Add Manual Discount
                                </button>
                            </div>
                        )}

                        {/* Summary lines */}
                        <div className="flex justify-between mb-2.5 text-sm text-[#64748b]">
                            <span>Subtotal</span>
                            <span>₹{subtotal.toFixed(2)}</span>
                        </div>
                        {discountAmount > 0 && (
                            <div className="flex justify-between mb-2.5 text-sm font-bold text-green-600">
                                <span>Discount {discountType === 'Percentage' && `(${discountValue}%)`}</span>
                                <span>-₹{discountAmount.toFixed(2)}</span>
                            </div>
                        )}
                        <div className="flex justify-between mb-2.5 text-sm text-[#64748b]">
                            <span>Tax (18%)</span>
                            <span>₹{tax.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between border-t-2 border-dashed border-[#e2e8f0] mt-4 pt-4 mb-6 text-lg font-bold text-[#1e293b]">
                            <span>Total</span>
                            <span>₹{total.toFixed(2)}</span>
                        </div>

                        {/* Payment Inputs */}
                        <div className="mb-4">
                            <label className="block text-xs font-medium text-[#6c757d] mb-1">Amount to Pay</label>
                            <div className="flex">
                                <span className="bg-[#e9ecef] border border-[#ced4da] border-r-0 rounded-l-md px-3 py-2 text-[#495057] flex items-center justify-center text-sm font-medium">₹</span>
                                <input
                                    type="number"
                                    value={amountPaid}
                                    onChange={(e) => setAmountPaid(e.target.value)}
                                    readOnly={!canPartialPay}
                                    className={`w-full border border-[#ced4da] rounded-r-md px-3 py-2 text-sm focus:outline-none ${!canPartialPay ? 'bg-gray-50' : ''}`}
                                />
                            </div>
                            {canPartialPay && parseFloat(amountPaid) < total && (
                                <div className="text-[#dc3545] text-xs mt-1 font-bold">
                                    Balance: ₹{(total - parseFloat(amountPaid || 0)).toFixed(2)}
                                </div>
                            )}
                        </div>

                        {/* Payment Selectors */}
                        <div className="grid grid-cols-4 gap-2 mb-6">
                            {[
                                { id: 'Cash', icon: <Banknote className="w-5 h-5" />, label: 'Cash' },
                                { id: 'UPI', icon: <QrCode className="w-5 h-5" />, label: 'UPI' },
                                { id: 'Card', icon: <CreditCard className="w-5 h-5" />, label: 'Card' },
                                { id: 'BNPL', icon: <Wallet className="w-5 h-5" />, label: 'BNPL' },
                            ].map(method => (
                                <button
                                    key={method.id}
                                    onClick={() => {
                                        setPaymentMethod(method.id);
                                        if (method.id === 'BNPL') {
                                            setAmountPaid('0');
                                        } else if (parseFloat(amountPaid || '0') === 0) {
                                            setAmountPaid(total.toFixed(2));
                                        }
                                    }}
                                    className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-lg border transition-all ${paymentMethod === method.id
                                        ? 'bg-[#eff6ff] border-[#3b82f6] text-[#3b82f6]'
                                        : 'border-[#e2e8f0] text-[#64748b] hover:bg-[#f8fafc] hover:border-[#cbd5e1]'
                                        }`}
                                >
                                    {method.icon}
                                    <span className="text-[11px] font-semibold">{method.label}</span>
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={handleCheckout}
                            disabled={cart.length === 0 || isCheckingOut}
                            className={`w-full ${cart.length === 0 ? 'bg-gray-400' : 'bg-[#3b82f6] hover:bg-[#2563eb] shadow-[0_4px_6px_-1px_rgba(59,130,246,0.4)]'} text-white border-none py-4 rounded-xl font-semibold text-base transition-all hover:-translate-y-[1px] active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            {isCheckingOut ? 'Processing...' : 'Checkout'}
                        </button>

                        {cart.length > 0 && (
                            <div className="text-center mt-4">
                                <button onClick={() => setCart([])} className="text-[#dc3545] text-sm hover:underline font-medium bg-transparent border-none cursor-pointer">
                                    Clear Cart
                                </button>
                            </div>
                        )}
                    </div>
                </aside>
            </div>

            {/* --- MODALS --- */}

            {/* Customer Search Modal */}
            {showCustomerModal && (
                <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="flex justify-between items-center p-4 border-b border-gray-100">
                            <h3 className="font-bold text-lg text-gray-800">Find Customer</h3>
                            <button onClick={() => { setShowCustomerModal(false); setShowNewCustomerForm(false); }} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-5">
                            <div className="flex mb-4">
                                <span className="bg-gray-100 border border-gray-300 border-r-0 rounded-l-md px-3 py-2 text-gray-600 text-sm font-medium">+91</span>
                                <input 
                                    type="text" 
                                    placeholder="Mobile Number" 
                                    value={customerPhoneInput}
                                    onChange={(e) => setCustomerPhoneInput(e.target.value)}
                                    className="flex-1 border border-gray-300 rounded-r-none px-3 py-2 text-sm focus:outline-none focus:border-blue-500" 
                                />
                                <button 
                                    onClick={findCustomer}
                                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-r-md px-4 py-2 text-sm font-medium transition-colors"
                                >
                                    Find
                                </button>
                            </div>
                            
                            {showNewCustomerForm && (
                                <div className="mt-4 pt-4 border-t border-gray-100 bg-gray-50 -mx-5 px-5 pb-5">
                                    <div className="text-sm text-yellow-600 bg-yellow-50 border border-yellow-200 rounded p-2 mb-3">
                                        Customer not found. Create new?
                                    </div>
                                    <input 
                                        type="text" 
                                        placeholder="Customer Name" 
                                        value={customerNameInput}
                                        onChange={(e) => setCustomerNameInput(e.target.value)}
                                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 mb-3" 
                                    />
                                    <button 
                                        onClick={createCustomer}
                                        className="w-full bg-green-600 hover:bg-green-700 text-white rounded py-2 text-sm font-semibold shadow-sm"
                                    >
                                        Create & Select
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Manual Discount Modal */}
            {showManualDiscountModal && (
                <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden">
                        <div className="flex justify-between items-center p-4 border-b border-gray-100">
                            <h3 className="font-bold text-lg text-gray-800">Manual Discount</h3>
                            <button onClick={() => setShowManualDiscountModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-5">
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Discount Type</label>
                                <div className="flex border border-gray-300 rounded overflow-hidden">
                                    <button 
                                        onClick={() => setManualDiscountType('Percentage')}
                                        className={`flex-1 py-1.5 text-sm ${manualDiscountType === 'Percentage' ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
                                    >
                                        Percent (%)
                                    </button>
                                    <button 
                                        onClick={() => setManualDiscountType('Fixed')}
                                        className={`flex-1 py-1.5 text-sm ${manualDiscountType === 'Fixed' ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
                                    >
                                        Fixed (₹)
                                    </button>
                                </div>
                            </div>
                            <div className="mb-5">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
                                <input 
                                    type="number" 
                                    value={manualDiscountInput}
                                    onChange={(e) => setManualDiscountInput(e.target.value)}
                                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500" 
                                />
                            </div>
                            <button 
                                onClick={applyManualDiscount}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded py-2 text-sm font-semibold shadow-sm"
                            >
                                Apply Discount
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Success Modal */}
            {showSuccessModal && successBill && (
                <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden text-center p-8">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-500">
                            <CheckCircle className="w-10 h-10" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Successful!</h2>
                        <p className="text-gray-500 mb-6 font-medium">Bill #{successBill.billNumber} generated.</p>
                        
                        <div className="flex flex-col gap-3">
                            <button 
                                onClick={() => {
                                    setCart([]);
                                    setSelectedCustomer(null);
                                    setCustomerDebt(0);
                                    removePromo();
                                    setShowSuccessModal(false);
                                    setSuccessBill(null);
                                    setAmountPaid('');
                                }}
                                className="w-full bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl py-3 font-bold transition-all"
                            >
                                New Sale
                            </button>
                            <Link 
                                to={`/invoice/${successBill.billId}`}
                                target="_blank"
                                onClick={() => {
                                    setCart([]);
                                    setSelectedCustomer(null);
                                    removePromo();
                                    setShowSuccessModal(false);
                                }}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30 rounded-xl py-3 font-bold flex items-center justify-center gap-2 transition-all no-underline"
                            >
                                <Printer className="w-5 h-5" /> Print Bill
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Temp Icon placeholders since lucide-react might not have exact matches for raw bootstrap icons
const PackageIconPlaceholder = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" viewBox="0 0 16 16">
        <path d="M8.186 1.113a.5.5 0 0 0-.372 0L1.846 3.5l2.404.961L10.404 2l-2.218-.887zm3.564 1.426L5.596 5 8 5.961 14.154 3.5l-2.404-.961zm3.25 1.7-6.5 2.6v7.922l6.5-2.6V4.24zM7.5 14.762V6.838L1 4.239v7.923l6.5 2.6zM7.443.184a1.5 1.5 0 0 1 1.114 0l7.129 2.852A.5.5 0 0 1 16 3.5v8.662a1 1 0 0 1-.629.928l-7.185 2.874a.5.5 0 0 1-.372 0L.63 13.09a1 1 0 0 1-.63-.928V3.5a.5.5 0 0 1 .314-.464L7.443.184z" />
    </svg>
);

const CartIconPlaceholder = ({ className = "w-6 h-6" }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
    </svg>
);

export default Checkout;
