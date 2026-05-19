import React, { useState, useEffect } from 'react';
import { 
  Car, Compass, Layers, TrendingUp, Gem, Key, 
  Search, ShoppingBag, User, Heart, Trash2, Plus, 
  Minus, ChevronLeft, Phone, MessageSquare, Check, 
  MapPin, Info, Calendar, DollarSign, ExternalLink, 
  Share2, Shield, Users, Briefcase, Gauge, Droplet, Star
} from 'lucide-react';
import { CAR_DATA, CATEGORIES } from './data/cars';

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState('home');
  const [selectedCar, setSelectedCar] = useState(null);
  
  // App states
  const [cart, setCart] = useState(() => {
    const local = localStorage.getItem('kiezcars_cart');
    return local ? JSON.parse(local) : [];
  });
  const [favorites, setFavorites] = useState(() => {
    const local = localStorage.getItem('kiezcars_favorites');
    return local ? JSON.parse(local) : [];
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeDetailTab, setActiveDetailTab] = useState('desc');
  
  // Car detail settings (inside modal)
  const [detailMode, setDetailMode] = useState('hire'); // 'hire' or 'buy'
  const [detailQuantity, setDetailQuantity] = useState(1);
  const [detailDays, setDetailDays] = useState(3);
  
  // Profile settings
  const [userEmail, setUserEmail] = useState(() => {
    return localStorage.getItem('kiezcars_user') || '';
  });
  const [loginInput, setLoginInput] = useState('');
  const [successToast, setSuccessToast] = useState('');

  // Auto rotate home slider
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = [
    {
      title: "Premium Fleet of Hire Vehicles",
      desc: "Drive Tesla, Range Rover, & Land Cruiser from $65/day.",
      image: "https://images.unsplash.com/photo-1606016159991-dfe4f974be5c?auto=format&fit=crop&q=80&w=800",
      category: "Car Hire"
    },
    {
      title: "Buy Your Dream Vehicle Today",
      desc: "Top certified luxury and standard cars in pristine condition.",
      image: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80&w=800",
      category: "Luxury"
    },
    {
      title: "Eco-Friendly Electric Future",
      desc: "Go green with high-end Tesla & Mild Hybrid innovations.",
      image: "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&q=80&w=800",
      category: "Luxury"
    }
  ];

  useEffect(() => {
    if (activeTab === 'home') {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [activeTab]);

  // Local storage syncing
  useEffect(() => {
    localStorage.setItem('kiezcars_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('kiezcars_favorites', JSON.stringify(favorites));
  }, [favorites]);

  const triggerToast = (msg) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(''), 3000);
  };

  // Cart operations
  const addToCart = (car, mode, qtyOrDays) => {
    const existingIndex = cart.findIndex(item => item.car.id === car.id && item.mode === mode);
    if (existingIndex > -1) {
      const newCart = [...cart];
      if (mode === 'hire') {
        newCart[existingIndex].days = qtyOrDays;
      } else {
        newCart[existingIndex].quantity += qtyOrDays;
      }
      setCart(newCart);
    } else {
      setCart([...cart, {
        id: `${car.id}-${mode}`,
        car,
        mode,
        quantity: mode === 'buy' ? qtyOrDays : 1,
        days: mode === 'hire' ? qtyOrDays : 1
      }]);
    }
    triggerToast(`Added ${car.name} to enquiry cart!`);
  };

  const removeFromCart = (itemId) => {
    setCart(cart.filter(item => item.id !== itemId));
    triggerToast("Item removed from cart");
  };

  const updateCartQuantity = (itemId, change) => {
    setCart(cart.map(item => {
      if (item.id === itemId) {
        if (item.mode === 'hire') {
          const newDays = Math.max(1, item.days + change);
          return { ...item, days: newDays };
        } else {
          const newQty = Math.max(1, item.quantity + change);
          return { ...item, quantity: newQty };
        }
      }
      return item;
    }));
  };

  // Favorites operations
  const toggleFavorite = (carId, e) => {
    if (e) e.stopPropagation();
    if (favorites.includes(carId)) {
      setFavorites(favorites.filter(id => id !== carId));
      triggerToast("Removed from Wishlist");
    } else {
      setFavorites([...favorites, carId]);
      triggerToast("Added to Wishlist!");
    }
  };

  // Dynamic filter lists
  const getFilteredCars = () => {
    return CAR_DATA.filter(car => {
      const matchesSearch = car.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            car.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            car.specs.fuel.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (selectedCategory === 'all') return matchesSearch;
      if (selectedCategory === 'Car Hire') return matchesSearch && car.isHire;
      return matchesSearch && car.category === selectedCategory;
    });
  };

  // WhatsApp formatted enquiry string
  const getWhatsAppLink = (text) => {
    return `https://wa.me/256702370441?text=${encodeURIComponent(text)}`;
  };

  const generateSingleWhatsAppMessage = (car, mode, days, qty) => {
    let text = `Hello KieZcars! 👋\n\nI'm highly interested in the following vehicle:\n`;
    text += `🚗 *${car.name}*\n`;
    text += `• Category: ${car.category}\n`;
    text += `• Mode: ${mode === 'hire' ? 'Rental / Car Hire' : 'Outright Purchase'}\n`;
    
    if (mode === 'hire') {
      text += `• Duration: ${days} days\n`;
      text += `• Daily rate: $${car.priceHire}/day\n`;
      text += `• Rental Subtotal: $${car.priceHire * days}\n`;
      text += `• Refundable Deposit: $200\n`;
      text += `*Estimated Hire Price: $${(car.priceHire * days) + 200}*`;
    } else {
      text += `• Quantity: ${qty} unit(s)\n`;
      text += `• Unit Price: $${car.priceSale.toLocaleString()}\n`;
      text += `*Grand Total: $${(car.priceSale * qty).toLocaleString()}*`;
    }
    
    text += `\n\nPlease confirm availability and booking/sales steps. Thank you!`;
    return getWhatsAppLink(text);
  };

  const generateCartWhatsAppMessage = () => {
    let text = `Hello KieZcars! 👋\n\nI would like to place an enquiry for multiple vehicles:\n\n`;
    let grandTotal = 0;
    
    cart.forEach((item, index) => {
      const car = item.car;
      text += `${index + 1}. *${car.name}* (${item.mode === 'hire' ? 'Hire' : 'Buy'})\n`;
      if (item.mode === 'hire') {
        const sub = car.priceHire * item.days;
        text += `   • Rate: $${car.priceHire}/day × ${item.days} days = $${sub}\n`;
        grandTotal += sub;
      } else {
        const sub = car.priceSale * item.quantity;
        text += `   • Price: $${car.priceSale.toLocaleString()} × ${item.quantity} = $${sub.toLocaleString()}\n`;
        grandTotal += sub;
      }
    });
    
    text += `\n*Total Estimated Amount: $${grandTotal.toLocaleString()}*\n\n`;
    text += `Please verify availability and advise on next steps.`;
    return getWhatsAppLink(text);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setActiveTab('categories');
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (loginInput.trim()) {
      setUserEmail(loginInput);
      localStorage.setItem('kiezcars_user', loginInput);
      triggerToast("Signed In Successfully!");
      setLoginInput('');
    }
  };

  const handleLogout = () => {
    setUserEmail('');
    localStorage.removeItem('kiezcars_user');
    triggerToast("Logged Out Successfully");
  };

  return (
    <>
      {/* Visual Canvas flanking emulator */}
      <div className="desktop-bg-canvas">
        <div className="desktop-info-card">
          <div className="brand-feature-badge">
            <Car size={16} /> Premium Car Booking
          </div>
          <h1>KieZcars</h1>
          <p>
            Experience premium car sales and elite car hire rentals. Book seamlessly via WhatsApp.
            Optimized as a PWA, responsive, elegant, and offline capable.
          </p>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', flex: 1 }}>
              <h4 style={{ color: '#ff5733', fontSize: '1.2rem', marginBottom: '4px' }}>24/7</h4>
              <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>WhatsApp Support</span>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', flex: 1 }}>
              <h4 style={{ color: '#ff5733', fontSize: '1.2rem', marginBottom: '4px' }}>100%</h4>
              <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Secure Redirection</span>
            </div>
          </div>
        </div>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          {/* Main App Container */}
          <div className="app-emulator-container">
            
            {/* Header */}
            <header style={{
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
              position: 'sticky',
              top: 0,
              zIndex: 50,
              padding: '12px 16px',
              borderBottom: '1px solid var(--border-light)',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div onClick={() => setActiveTab('home')} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <div style={{
                    background: 'var(--primary)',
                    color: 'white',
                    padding: '8px',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Car size={20} />
                  </div>
                  <span style={{ fontWeight: '800', fontSize: '1.3rem', letterSpacing: '-0.03em' }}>
                    KieZ<span style={{ color: 'var(--primary)' }}>cars</span>
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <button 
                    onClick={() => setActiveTab('favorites')}
                    style={{ position: 'relative', background: 'transparent', border: 'none', cursor: 'pointer', padding: '6px', color: '#64748b' }}
                  >
                    <Heart size={22} fill={favorites.length > 0 ? "var(--danger)" : "none"} color={favorites.length > 0 ? "var(--danger)" : "#64748b"} />
                    {favorites.length > 0 && (
                      <span style={{
                        position: 'absolute', top: -1, right: -1,
                        background: 'var(--danger)', color: 'white',
                        fontSize: '0.65rem', fontWeight: 'bold',
                        padding: '1.5px 5px', borderRadius: '99px'
                      }}>{favorites.length}</span>
                    )}
                  </button>

                  <button 
                    onClick={() => setActiveTab('cart')}
                    style={{ position: 'relative', background: 'transparent', border: 'none', cursor: 'pointer', padding: '6px', color: '#64748b' }}
                  >
                    <ShoppingBag size={22} color={cart.length > 0 ? "var(--primary)" : "#64748b"} />
                    {cart.length > 0 && (
                      <span style={{
                        position: 'absolute', top: -1, right: -1,
                        background: 'var(--primary)', color: 'white',
                        fontSize: '0.65rem', fontWeight: 'bold',
                        padding: '1.5px 5px', borderRadius: '99px'
                      }}>{cart.length}</span>
                    )}
                  </button>
                </div>
              </div>

              {/* Search Bar Input */}
              <form onSubmit={handleSearchSubmit} style={{ position: 'relative', width: '100%' }}>
                <input 
                  type="text"
                  placeholder="Search sports cars, luxury SUVs, hire terms..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    paddingLeft: '40px',
                    height: '42px',
                    borderRadius: '14px',
                    border: '1px solid #e2e8f0',
                    fontSize: '0.88rem'
                  }}
                />
                <Search size={18} style={{ position: 'absolute', left: '14px', top: '12px', color: 'var(--text-muted)' }} />
                {searchQuery && (
                  <button 
                    type="button" 
                    onClick={() => setSearchQuery('')}
                    style={{ position: 'absolute', right: '14px', top: '11px', border: 'none', background: 'transparent', color: '#94a3b8', fontSize: '0.85rem', cursor: 'pointer' }}
                  >
                    Clear
                  </button>
                )}
              </form>
            </header>

            {/* Success Toast */}
            {successToast && (
              <div style={{
                position: 'absolute',
                top: '75px', left: '50%', transform: 'translateX(-50%)',
                background: '#0f172a', color: 'white',
                padding: '10px 18px', borderRadius: '99px',
                fontSize: '0.85rem', fontWeight: '500',
                display: 'flex', alignItems: 'center', gap: '8px',
                boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
                zIndex: 99,
                animation: 'fadeIn 0.25s ease-out'
              }}>
                <Check size={16} color="#10b981" strokeWidth={3} />
                <span>{successToast}</span>
              </div>
            )}

            {/* Scrollable Core Screens */}
            <main style={{ flex: 1, overflowY: 'auto', paddingBottom: '30px', background: '#f8fafc' }}>
              
              {/* SCREEN: HOME */}
              {activeTab === 'home' && (
                <div className="animate-fade-in">
                  
                  {/* Hero carousel */}
                  <div style={{ position: 'relative', width: '100%', height: '170px', overflow: 'hidden' }}>
                    <div style={{
                      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                      backgroundImage: `url(${slides[currentSlide].image})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      filter: 'brightness(0.65)',
                      transition: 'background-image 0.8s ease-in-out'
                    }} />
                    
                    <div style={{
                      position: 'relative', height: '100%', padding: '24px 20px',
                      display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', color: 'white'
                    }}>
                      <div style={{
                        background: 'rgba(255, 87, 51, 0.2)', border: '1px solid rgba(255, 87, 51, 0.4)',
                        color: '#ff8b70', fontSize: '0.68rem', fontWeight: '800', width: 'fit-content',
                        padding: '3px 8px', borderRadius: '6px', marginBottom: '8px', letterSpacing: '0.05em'
                      }}>
                        {slides[currentSlide].category.toUpperCase()}
                      </div>
                      <h2 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '4px', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
                        {slides[currentSlide].title}
                      </h2>
                      <p style={{ fontSize: '0.8rem', color: '#e2e8f0', textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
                        {slides[currentSlide].desc}
                      </p>
                    </div>

                    {/* Dots indicator */}
                    <div style={{ position: 'absolute', bottom: '12px', right: '20px', display: 'flex', gap: '6px' }}>
                      {slides.map((_, i) => (
                        <div 
                          key={i}
                          onClick={() => setCurrentSlide(i)}
                          style={{
                            width: currentSlide === i ? '18px' : '6px',
                            height: '6px',
                            borderRadius: '3px',
                            background: currentSlide === i ? 'var(--primary)' : 'rgba(255,255,255,0.5)',
                            cursor: 'pointer',
                            transition: 'var(--transition)'
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Horizontal Category Icons Grid */}
                  <div style={{ padding: '20px 16px' }}>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>Browse by Vehicle Type</span>
                      <span onClick={() => { setSelectedCategory('all'); setActiveTab('categories'); }} style={{ color: 'var(--primary)', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer' }}>View All</span>
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
                      {CATEGORIES.slice(1).map((cat) => {
                        const IconComponent = {
                          SUV: Compass,
                          Luxury: Gem,
                          Hatchback: TrendingUp,
                          Sedan: Layers,
                          "Car Hire": Key
                        }[cat.id] || Car;

                        return (
                          <div 
                            key={cat.id} 
                            onClick={() => { setSelectedCategory(cat.id); setActiveTab('categories'); }}
                            style={{
                              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer'
                            }}
                          >
                            <div style={{
                              width: '50px', height: '50px',
                              borderRadius: '16px',
                              background: '#ffffff',
                              border: '1px solid #f1f5f9',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              boxShadow: 'var(--shadow-sm)',
                              color: 'var(--primary)',
                              transition: 'var(--transition)'
                            }}>
                              <IconComponent size={22} />
                            </div>
                            <span style={{ fontSize: '0.7rem', fontWeight: '600', color: 'var(--text-muted)', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%' }}>
                              {cat.id === "Car Hire" ? "Hire" : cat.id}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Featured Vehicles List (2-column grid layout) */}
                  <div style={{ padding: '0 16px 20px 16px' }}>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '14px' }}>
                      🔥 Hot Deals of the Week
                    </h3>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
                      {CAR_DATA.slice(0, 4).map((car) => (
                        <div 
                          key={car.id} 
                          onClick={() => { setSelectedCar(car); setDetailMode(car.isHire ? 'hire' : 'buy'); }}
                          style={{
                            background: 'white',
                            borderRadius: '20px',
                            overflow: 'hidden',
                            boxShadow: 'var(--shadow-sm)',
                            border: '1px solid #f1f5f9',
                            position: 'relative',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column'
                          }}
                        >
                          {/* Wishlist Heart */}
                          <button 
                            onClick={(e) => toggleFavorite(car.id, e)}
                            style={{
                              position: 'absolute', top: '10px', right: '10px',
                              width: '28px', height: '28px', borderRadius: '50%',
                              background: 'rgba(255, 255, 255, 0.85)',
                              border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
                              zIndex: 10, cursor: 'pointer', color: '#64748b'
                            }}
                          >
                            <Heart size={15} fill={favorites.includes(car.id) ? "var(--danger)" : "none"} color={favorites.includes(car.id) ? "var(--danger)" : "#64748b"} />
                          </button>

                          {/* Badge tag */}
                          <span className={`card-badge ${car.isHire && !car.isSale ? 'hire' : 'sale'}`}>
                            {car.tags[0]}
                          </span>

                          <div style={{ width: '100%', height: '110px', overflow: 'hidden' }}>
                            <img src={car.images[0]} alt={car.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>

                          <div style={{ padding: '10px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '3px', marginBottom: '4px' }}>
                                <Star size={11} fill="var(--warning)" color="var(--warning)" />
                                <span style={{ fontSize: '0.72rem', fontWeight: '700' }}>{car.rating}</span>
                                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>({car.reviewsCount})</span>
                              </div>

                              <h4 style={{ fontSize: '0.82rem', fontWeight: '700', lineHeight: '1.2', color: 'var(--text-main)', marginBottom: '6px' }}>
                                {car.name}
                              </h4>
                            </div>

                            <div>
                              <div style={{ display: 'flex', gap: '8px', fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: '8px', flexWrap: 'wrap' }}>
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}><Gauge size={10} />{car.specs.horsepower}</span>
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}><Droplet size={10} />{car.specs.fuel}</span>
                              </div>

                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '8px' }}>
                                <div>
                                  {car.isHire && (
                                    <div style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--primary)' }}>
                                      ${car.priceHire}<span style={{ fontSize: '0.65rem', fontWeight: '500', color: 'var(--text-muted)' }}>/d</span>
                                    </div>
                                  )}
                                  {car.isSale && !car.isHire && (
                                    <div style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-main)' }}>
                                      ${car.priceSale.toLocaleString()}
                                    </div>
                                  )}
                                </div>
                                <div style={{
                                  background: 'var(--primary-light)',
                                  color: 'var(--primary)',
                                  borderRadius: '8px',
                                  width: '26px', height: '26px',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  fontSize: '1rem', fontWeight: 'bold'
                                }}>
                                  +
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Booking Guarantee Banner */}
                  <div style={{ padding: '0 16px' }}>
                    <div style={{
                      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                      borderRadius: '24px', padding: '16px', color: 'white',
                      display: 'flex', alignItems: 'center', gap: '16px',
                      boxShadow: 'var(--shadow-md)'
                    }}>
                      <div style={{
                        background: 'rgba(255, 87, 51, 0.15)', color: 'var(--primary)',
                        padding: '12px', borderRadius: '18px'
                      }}>
                        <Shield size={24} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ fontSize: '0.9rem', fontWeight: '700', marginBottom: '3px' }}>WhatsApp Direct Guarantee</h4>
                        <p style={{ fontSize: '0.72rem', color: '#94a3b8', lineHeight: '1.4' }}>
                          No credit card needed online! Order details are automatically formatted and verified by representative in minutes.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SCREEN: CATEGORIES / SEARCH */}
              {activeTab === 'categories' && (
                <div className="animate-fade-in" style={{ padding: '16px 0' }}>
                  
                  {/* Category Chip List Scrollbar */}
                  <div style={{
                    display: 'flex', gap: '8px', overflowX: 'auto',
                    padding: '0 16px 14px 16px',
                    whiteSpace: 'nowrap',
                    borderBottom: '1px solid var(--border-light)'
                  }}>
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        style={{
                          background: selectedCategory === cat.id ? 'var(--primary)' : 'white',
                          color: selectedCategory === cat.id ? 'white' : 'var(--text-main)',
                          border: selectedCategory === cat.id ? '1px solid var(--primary)' : '1px solid #e2e8f0',
                          padding: '8px 16px',
                          borderRadius: '99px',
                          fontSize: '0.8rem',
                          fontWeight: '600',
                          cursor: 'pointer',
                          boxShadow: selectedCategory === cat.id ? '0 4px 12px rgba(255, 87, 51, 0.2)' : 'none',
                          transition: 'var(--transition)'
                        }}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>

                  {/* Listings Result count */}
                  <div style={{ padding: '16px 16px 8px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Showing <b>{getFilteredCars().length}</b> vehicles
                    </span>
                    {searchQuery && (
                      <span style={{ fontSize: '0.8rem', color: 'var(--primary)' }}>
                        Query: "{searchQuery}"
                      </span>
                    )}
                  </div>

                  {/* Grid list of Category Filtered Cars */}
                  <div style={{ padding: '0 16px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
                    {getFilteredCars().length > 0 ? (
                      getFilteredCars().map((car) => (
                        <div 
                          key={car.id} 
                          onClick={() => { setSelectedCar(car); setDetailMode(car.isHire ? 'hire' : 'buy'); }}
                          style={{
                            background: 'white',
                            borderRadius: '20px',
                            overflow: 'hidden',
                            boxShadow: 'var(--shadow-sm)',
                            border: '1px solid #f1f5f9',
                            position: 'relative',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column'
                          }}
                        >
                          <button 
                            onClick={(e) => toggleFavorite(car.id, e)}
                            style={{
                              position: 'absolute', top: '10px', right: '10px',
                              width: '28px', height: '28px', borderRadius: '50%',
                              background: 'rgba(255, 255, 255, 0.85)',
                              border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
                              zIndex: 10, cursor: 'pointer', color: '#64748b'
                            }}
                          >
                            <Heart size={15} fill={favorites.includes(car.id) ? "var(--danger)" : "none"} color={favorites.includes(car.id) ? "var(--danger)" : "#64748b"} />
                          </button>

                          <span className={`card-badge ${car.isHire && !car.isSale ? 'hire' : 'sale'}`}>
                            {car.category}
                          </span>

                          <div style={{ width: '100%', height: '110px', overflow: 'hidden' }}>
                            <img src={car.images[0]} alt={car.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>

                          <div style={{ padding: '10px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '3px', marginBottom: '4px' }}>
                                <Star size={11} fill="var(--warning)" color="var(--warning)" />
                                <span style={{ fontSize: '0.72rem', fontWeight: '700' }}>{car.rating}</span>
                                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>({car.reviewsCount})</span>
                              </div>

                              <h4 style={{ fontSize: '0.82rem', fontWeight: '700', lineHeight: '1.2', color: 'var(--text-main)', marginBottom: '6px' }}>
                                {car.name}
                              </h4>
                            </div>

                            <div>
                              <div style={{ display: 'flex', gap: '8px', fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: '8px', flexWrap: 'wrap' }}>
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}><Users size={10} /> {car.specs.passengers} seats</span>
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}><Gauge size={10} /> {car.specs.transmission}</span>
                              </div>

                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '8px' }}>
                                <div>
                                  {car.isHire && (
                                    <div style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--primary)' }}>
                                      ${car.priceHire}<span style={{ fontSize: '0.65rem', fontWeight: '500', color: 'var(--text-muted)' }}>/d</span>
                                    </div>
                                  )}
                                  {car.isSale && !car.isHire && (
                                    <div style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-main)' }}>
                                      ${car.priceSale.toLocaleString()}
                                    </div>
                                  )}
                                </div>
                                <div style={{
                                  background: 'var(--primary-light)',
                                  color: 'var(--primary)',
                                  borderRadius: '8px',
                                  width: '26px', height: '26px',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  fontSize: '1rem', fontWeight: 'bold'
                                }}>
                                  +
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div style={{ gridColumn: 'span 2', textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                        <Car size={40} style={{ color: '#cbd5e1', marginBottom: '10px' }} />
                        <h4 style={{ color: 'var(--text-main)', marginBottom: '4px' }}>No Cars Found</h4>
                        <p style={{ fontSize: '0.8rem' }}>We couldn't match your query. Try broadening your keywords!</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* SCREEN: FAVORITES */}
              {activeTab === 'favorites' && (
                <div className="animate-fade-in" style={{ padding: '16px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '4px' }}>
                    Your Saved Showroom
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                    Easily compare or launch enquiries for your favorite vehicles.
                  </p>

                  {favorites.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
                      {CAR_DATA.filter(car => favorites.includes(car.id)).map((car) => (
                        <div 
                          key={car.id} 
                          onClick={() => { setSelectedCar(car); setDetailMode(car.isHire ? 'hire' : 'buy'); }}
                          style={{
                            background: 'white',
                            borderRadius: '20px',
                            overflow: 'hidden',
                            boxShadow: 'var(--shadow-sm)',
                            border: '1px solid #f1f5f9',
                            position: 'relative',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column'
                          }}
                        >
                          <button 
                            onClick={(e) => toggleFavorite(car.id, e)}
                            style={{
                              position: 'absolute', top: '10px', right: '10px',
                              width: '28px', height: '28px', borderRadius: '50%',
                              background: 'rgba(255, 255, 255, 0.85)',
                              border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
                              zIndex: 10, cursor: 'pointer', color: '#64748b'
                            }}
                          >
                            <Heart size={15} fill="var(--danger)" color="var(--danger)" />
                          </button>

                          <div style={{ width: '100%', height: '110px', overflow: 'hidden' }}>
                            <img src={car.images[0]} alt={car.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>

                          <div style={{ padding: '10px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                            <div>
                              <h4 style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '6px' }}>
                                {car.name}
                              </h4>
                            </div>

                            <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '8px' }}>
                                <div>
                                  {car.isHire && (
                                    <div style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--primary)' }}>
                                      ${car.priceHire}<span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>/d</span>
                                    </div>
                                  )}
                                  {car.isSale && !car.isHire && (
                                    <div style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-main)' }}>
                                      ${car.priceSale.toLocaleString()}
                                    </div>
                                  )}
                                </div>
                                <div style={{
                                  background: 'var(--primary-light)',
                                  color: 'var(--primary)',
                                  borderRadius: '8px',
                                  width: '26px', height: '26px',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  fontSize: '1rem', fontWeight: 'bold'
                                }}>
                                  +
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
                      <Heart size={44} style={{ color: '#cbd5e1', marginBottom: '10px' }} />
                      <h4 style={{ color: 'var(--text-main)', marginBottom: '4px' }}>No Favorites Yet</h4>
                      <p style={{ fontSize: '0.8rem' }}>Tap the heart icons on cars to populate your personalized showroom.</p>
                      <button 
                        onClick={() => setActiveTab('home')}
                        style={{
                          marginTop: '15px', background: 'var(--primary)', color: 'white',
                          border: 'none', padding: '8px 18px', borderRadius: '12px',
                          fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer'
                        }}
                      >
                        Explore Vehicles
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* SCREEN: CART & CHECKOUT FLOW */}
              {activeTab === 'cart' && (
                <div className="animate-fade-in" style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-main)' }}>
                      Booking Enquiry Cart
                    </h3>
                    {cart.length > 0 && (
                      <button 
                        onClick={() => { setCart([]); triggerToast("Cleared all cart items"); }}
                        style={{ border: 'none', background: 'transparent', color: 'var(--danger)', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer' }}
                      >
                        Clear All
                      </button>
                    )}
                  </div>

                  {cart.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      {cart.map((item) => (
                        <div 
                          key={item.id}
                          style={{
                            background: 'white',
                            borderRadius: '20px',
                            border: '1px solid #f1f5f9',
                            padding: '12px',
                            display: 'flex',
                            gap: '12px',
                            position: 'relative'
                          }}
                        >
                          <div style={{ width: '80px', height: '70px', borderRadius: '14px', overflow: 'hidden', flexShrink: 0 }}>
                            <img src={item.car.images[0]} alt={item.car.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>

                          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                            <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <h4 style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-main)', maxWidth: '85%' }}>
                                  {item.car.name}
                                </h4>
                                <button 
                                  onClick={() => removeFromCart(item.id)}
                                  style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                              <span style={{
                                fontSize: '0.68rem', fontWeight: '700', padding: '2px 6px', borderRadius: '6px',
                                background: item.mode === 'hire' ? 'var(--primary-light)' : '#f1f5f9',
                                color: item.mode === 'hire' ? 'var(--primary)' : 'var(--text-main)',
                                display: 'inline-block', marginTop: '3px'
                              }}>
                                {item.mode === 'hire' ? 'Rental Hire' : 'Buy Sale'}
                              </span>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                              <div style={{ fontSize: '0.9rem', fontWeight: '800' }}>
                                ${item.mode === 'hire' ? (item.car.priceHire * item.days) : (item.car.priceSale * item.quantity)}
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f8fafc', padding: '4px 8px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                <button 
                                  onClick={() => updateCartQuantity(item.id, -1)}
                                  style={{ border: 'none', background: 'transparent', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                                >
                                  <Minus size={14} />
                                </button>
                                <span style={{ fontSize: '0.8rem', fontWeight: '700', minWidth: '16px', textAlign: 'center' }}>
                                  {item.mode === 'hire' ? item.days : item.quantity}
                                </span>
                                <button 
                                  onClick={() => updateCartQuantity(item.id, 1)}
                                  style={{ border: 'none', background: 'transparent', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                                >
                                  <Plus size={14} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Order Summary Card */}
                      <div style={{
                        background: 'white',
                        borderRadius: '24px',
                        border: '1px solid #f1f5f9',
                        padding: '16px',
                        marginTop: '10px'
                      }}>
                        <h4 style={{ fontSize: '0.9rem', fontWeight: '700', marginBottom: '12px', color: 'var(--text-main)' }}>Summary Summary</h4>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Vehicles in Enquiry</span>
                            <span>{cart.length} item(s)</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Security Refundable Deposit</span>
                            <span>$200</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed #e2e8f0', paddingTop: '10px', fontSize: '0.95rem', fontWeight: '800', color: 'var(--text-main)' }}>
                            <span>Grand Total Estimate</span>
                            <span style={{ color: 'var(--primary)' }}>
                              ${(cart.reduce((sum, item) => sum + (item.mode === 'hire' ? (item.car.priceHire * item.days) : (item.car.priceSale * item.quantity)), 0) + 200).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Whatsapp Checkout Button */}
                      <a 
                        href={generateCartWhatsAppMessage()}
                        target="_blank"
                        rel="noreferrer"
                        className="animate-pulse-green"
                        style={{
                          background: 'var(--success)', color: 'white',
                          padding: '16px', borderRadius: '18px',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                          fontWeight: '700', textDecoration: 'none', fontSize: '0.95rem',
                          textAlign: 'center', marginTop: '10px'
                        }}
                      >
                        <MessageSquare size={20} fill="white" />
                        <span>Submit Booking Enquiry via WhatsApp</span>
                      </a>
                      
                      <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '4px' }}>
                        This links directly to booking support number: <b>+256702370441</b>. We respond instantly.
                      </p>
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
                      <ShoppingBag size={44} style={{ color: '#cbd5e1', marginBottom: '10px' }} />
                      <h4 style={{ color: 'var(--text-main)', marginBottom: '4px' }}>Cart is Empty</h4>
                      <p style={{ fontSize: '0.8rem' }}>Browse our showroom and add cars you want to rent or purchase.</p>
                      <button 
                        onClick={() => setActiveTab('home')}
                        style={{
                          marginTop: '15px', background: 'var(--primary)', color: 'white',
                          border: 'none', padding: '8px 18px', borderRadius: '12px',
                          fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer'
                        }}
                      >
                        Find a Car
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* SCREEN: ACCOUNT & PWA INFORMATION */}
              {activeTab === 'account' && (
                <div className="animate-fade-in" style={{ padding: '16px' }}>
                  
                  {/* Profile Section */}
                  <div style={{
                    background: 'white', borderRadius: '24px', padding: '20px',
                    border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', alignItems: 'center',
                    marginBottom: '16px', textAlign: 'center'
                  }}>
                    <div style={{
                      width: '64px', height: '64px', borderRadius: '50%',
                      background: 'var(--primary-light)', color: 'var(--primary)',
                      display: 'flex', alignItems: 'center', justify: 'center',
                      fontSize: '1.8rem', fontWeight: '800', marginBottom: '12px'
                    }}>
                      {userEmail ? userEmail[0].toUpperCase() : <User size={30} />}
                    </div>

                    {userEmail ? (
                      <div>
                        <h4 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-main)' }}>{userEmail}</h4>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Active Showroom Member</span>
                        <button 
                          onClick={handleLogout}
                          style={{
                            marginTop: '12px', background: 'transparent', color: 'var(--danger)',
                            border: '1px solid var(--danger)', padding: '5px 12px', borderRadius: '8px',
                            fontSize: '0.72rem', fontWeight: '600', cursor: 'pointer'
                          }}
                        >
                          Sign Out
                        </button>
                      </div>
                    ) : (
                      <form onSubmit={handleLogin} style={{ width: '100%' }}>
                        <h4 style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '4px' }}>Welcome Guest User</h4>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '14px' }}>Sign in to synchronize your favorites list and bookings.</p>
                        
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <input 
                            type="email" 
                            required
                            placeholder="Enter your email address"
                            value={loginInput}
                            onChange={(e) => setLoginInput(e.target.value)}
                            style={{ flex: 1, height: '38px', fontSize: '0.8rem' }}
                          />
                          <button 
                            type="submit"
                            style={{
                              background: 'var(--primary)', color: 'white', border: 'none',
                              padding: '0 14px', borderRadius: '12px', fontSize: '0.8rem',
                              fontWeight: '600', cursor: 'pointer'
                            }}
                          >
                            Sign In
                          </button>
                        </div>
                      </form>
                    )}
                  </div>

                  {/* Direct Contact & Support */}
                  <div style={{
                    background: 'white', borderRadius: '24px', padding: '16px',
                    border: '1px solid #f1f5f9', marginBottom: '16px'
                  }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: '800', marginBottom: '12px' }}>KieZcars Support Center</h4>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <a 
                        href="tel:+256702370441"
                        style={{
                          display: 'flex', alignItems: 'center', gap: '12px',
                          padding: '12px', borderRadius: '14px', background: '#f8fafc',
                          textDecoration: 'none', color: 'var(--text-main)', fontSize: '0.82rem',
                          border: '1px solid #e2e8f0', transition: 'var(--transition)'
                        }}
                      >
                        <div style={{ color: 'var(--primary)', background: 'var(--primary-light)', padding: '8px', borderRadius: '10px' }}>
                          <Phone size={18} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: '700' }}>Direct Call Support</div>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>+256 702 370441 (Uganda HQ)</span>
                        </div>
                      </a>

                      <a 
                        href="https://wa.me/256702370441"
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: 'flex', alignItems: 'center', gap: '12px',
                          padding: '12px', borderRadius: '14px', background: '#f8fafc',
                          textDecoration: 'none', color: 'var(--text-main)', fontSize: '0.82rem',
                          border: '1px solid #e2e8f0', transition: 'var(--transition)'
                        }}
                      >
                        <div style={{ color: 'var(--success)', background: 'var(--success-light)', padding: '8px', borderRadius: '10px' }}>
                          <MessageSquare size={18} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: '700' }}>Direct WhatsApp Chat</div>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Tap to instantly message representatives</span>
                        </div>
                      </a>
                    </div>
                  </div>

                  {/* PWA Offline Installation Guide */}
                  <div style={{
                    background: 'white', borderRadius: '24px', padding: '16px',
                    border: '1px solid #f1f5f9'
                  }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: '800', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Info size={16} color="var(--primary)" /> 
                      PWA Installation Guide
                    </h4>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                        <div style={{ background: '#f1f5f9', color: 'var(--text-main)', width: '20px', height: '20px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0 }}>1</div>
                        <p><b>iOS Safari</b>: Tap the share icon <Share2 size={12} style={{ display: 'inline', verticalAlign: 'middle' }} /> at the bottom of Safari browser and click <b>"Add to Home Screen"</b>.</p>
                      </div>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                        <div style={{ background: '#f1f5f9', color: 'var(--text-main)', width: '20px', height: '20px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0 }}>2</div>
                        <p><b>Android Chrome</b>: Tap the vertical menu icon in the upper-right corner and select <b>"Install app"</b> or <b>"Add to Home screen"</b>.</p>
                      </div>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                        <div style={{ background: '#f1f5f9', color: 'var(--text-main)', width: '20px', height: '20px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0 }}>3</div>
                        <p>Enjoy fast launch, smooth page transitions, PWA frame borders, offline capabilities, and zero browser tab clutter!</p>
                      </div>
                    </div>
                  </div>

                </div>
              )}

            </main>

            {/* Bottom sticky navigation footer */}
            <footer style={{
              background: '#ffffff',
              borderTop: '1px solid var(--border-light)',
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              height: '62px',
              position: 'relative',
              zIndex: 40
            }}>
              <button 
                onClick={() => { setActiveTab('home'); setSelectedCategory('all'); }}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px',
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  color: activeTab === 'home' ? 'var(--primary)' : 'var(--text-muted)'
                }}
              >
                <Compass size={20} />
                <span style={{ fontSize: '0.65rem', fontWeight: '600' }}>Home</span>
              </button>

              <button 
                onClick={() => { setActiveTab('categories'); }}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px',
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  color: activeTab === 'categories' ? 'var(--primary)' : 'var(--text-muted)'
                }}
              >
                <Layers size={20} />
                <span style={{ fontSize: '0.65rem', fontWeight: '600' }}>Categories</span>
              </button>

              {/* Raised Centered Floating WhatsApp Chat Button */}
              <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
                <a 
                  href="https://wa.me/256702370441"
                  target="_blank"
                  rel="noreferrer"
                  className="animate-pulse-coral"
                  style={{
                    position: 'absolute',
                    top: '-18px',
                    background: 'var(--primary)',
                    color: 'white',
                    width: '54px', height: '54px',
                    borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 8px 20px rgba(255, 87, 51, 0.45)',
                    border: '4px solid #ffffff',
                    cursor: 'pointer',
                    zIndex: 45
                  }}
                >
                  <MessageSquare size={22} fill="white" />
                </a>
                <span style={{ position: 'absolute', bottom: '6px', fontSize: '0.65rem', fontWeight: '600', color: 'var(--text-muted)' }}>
                  Chat Support
                </span>
              </div>

              <button 
                onClick={() => setActiveTab('cart')}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px',
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  color: activeTab === 'cart' ? 'var(--primary)' : 'var(--text-muted)'
                }}
              >
                <ShoppingBag size={20} />
                <span style={{ fontSize: '0.65rem', fontWeight: '600' }}>Cart</span>
              </button>

              <button 
                onClick={() => setActiveTab('account')}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px',
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  color: activeTab === 'account' ? 'var(--primary)' : 'var(--text-muted)'
                }}
              >
                <User size={20} />
                <span style={{ fontSize: '0.65rem', fontWeight: '600' }}>Account</span>
              </button>
            </footer>

            {/* FULL CAR PRODUCT DETAILS PAGE MODAL (Slides in over content) */}
            {selectedCar && (
              <div style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                background: '#ffffff',
                zIndex: 100,
                display: 'flex',
                flexDirection: 'column',
                animation: 'slideLeft 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards'
              }}>
                {/* Header panel */}
                <div style={{
                  padding: '12px 16px',
                  borderBottom: '1px solid var(--border-light)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: '#ffffff'
                }}>
                  <button 
                    onClick={() => setSelectedCar(null)}
                    style={{
                      background: 'transparent', border: 'none', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: '4px',
                      color: 'var(--text-main)', fontSize: '0.88rem', fontWeight: '600'
                    }}
                  >
                    <ChevronLeft size={20} />
                    <span>Back</span>
                  </button>

                  <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                    <button 
                      onClick={(e) => toggleFavorite(selectedCar.id, e)}
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}
                    >
                      <Heart size={22} fill={favorites.includes(selectedCar.id) ? "var(--danger)" : "none"} color={favorites.includes(selectedCar.id) ? "var(--danger)" : "#64748b"} />
                    </button>
                  </div>
                </div>

                {/* Content Area */}
                <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '80px' }}>
                  
                  {/* Photo details hero cover */}
                  <div style={{ width: '100%', height: '220px', position: 'relative' }}>
                    <img src={selectedCar.images[0]} alt={selectedCar.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <span className="card-badge" style={{ top: '16px', left: '16px' }}>
                      {selectedCar.category}
                    </span>
                  </div>

                  {/* Core detail summary */}
                  <div style={{ padding: '16px 20px 0 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
                      <Star size={14} fill="var(--warning)" color="var(--warning)" />
                      <span style={{ fontSize: '0.85rem', fontWeight: '700' }}>{selectedCar.rating}</span>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>({selectedCar.reviewsCount} reviews)</span>
                    </div>

                    <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '14px' }}>
                      {selectedCar.name}
                    </h2>

                    {/* Spec badges grid */}
                    <div style={{
                      display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px',
                      background: '#f8fafc', padding: '12px', borderRadius: '16px',
                      border: '1px solid #e2e8f0', marginBottom: '20px'
                    }}>
                      <div style={{ textAlign: 'center' }}>
                        <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>ENG</span>
                        <span style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-main)', wordBreak: 'break-word' }}>{selectedCar.specs.fuel}</span>
                      </div>
                      <div style={{ textAlign: 'center', borderLeft: '1px solid #e2e8f0' }}>
                        <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>SEAT</span>
                        <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-main)' }}>{selectedCar.specs.passengers} Pls</span>
                      </div>
                      <div style={{ textAlign: 'center', borderLeft: '1px solid #e2e8f0' }}>
                        <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>GEAR</span>
                        <span style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>{selectedCar.specs.transmission[0]} Auto</span>
                      </div>
                      <div style={{ textAlign: 'center', borderLeft: '1px solid #e2e8f0' }}>
                        <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>HP</span>
                        <span style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--text-main)' }}>{selectedCar.specs.horsepower}</span>
                      </div>
                    </div>

                    {/* Mode selector (if both sell & hire available) */}
                    {selectedCar.isHire && selectedCar.isSale && (
                      <div style={{
                        display: 'flex', background: '#f1f5f9', padding: '4px',
                        borderRadius: '12px', marginBottom: '20px', border: '1px solid #e2e8f0'
                      }}>
                        <button 
                          onClick={() => setDetailMode('hire')}
                          style={{
                            flex: 1, padding: '8px', border: 'none', borderRadius: '10px',
                            background: detailMode === 'hire' ? 'white' : 'transparent',
                            color: detailMode === 'hire' ? 'var(--primary)' : 'var(--text-muted)',
                            fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer',
                            boxShadow: detailMode === 'hire' ? 'var(--shadow-sm)' : 'none'
                          }}
                        >
                          Book/Rent Car
                        </button>
                        <button 
                          onClick={() => setDetailMode('buy')}
                          style={{
                            flex: 1, padding: '8px', border: 'none', borderRadius: '10px',
                            background: detailMode === 'buy' ? 'white' : 'transparent',
                            color: detailMode === 'buy' ? 'var(--primary)' : 'var(--text-muted)',
                            fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer',
                            boxShadow: detailMode === 'buy' ? 'var(--shadow-sm)' : 'none'
                          }}
                        >
                          Buy/Purchase
                        </button>
                      </div>
                    )}

                    {/* Pricing configuration details */}
                    <div style={{
                      background: 'var(--primary-light)', padding: '16px', borderRadius: '20px',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'
                    }}>
                      <div>
                        <span style={{ fontSize: '0.72rem', color: 'var(--primary)', fontWeight: '700' }}>
                          {detailMode === 'hire' ? 'Rental Day Rate' : 'Outright Price'}
                        </span>
                        <div style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-main)' }}>
                          ${detailMode === 'hire' ? selectedCar.priceHire : selectedCar.priceSale.toLocaleString()}
                          {detailMode === 'hire' && <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '500' }}>/day</span>}
                        </div>
                      </div>

                      {/* Quantity / Days adjustments */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'white', padding: '6px 12px', borderRadius: '10px', border: '1px solid rgba(255, 87, 51, 0.2)' }}>
                        <button 
                          onClick={() => {
                            if (detailMode === 'hire') {
                              setDetailDays(prev => Math.max(1, prev - 1));
                            } else {
                              setDetailQuantity(prev => Math.max(1, prev - 1));
                            }
                          }}
                          style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748b' }}
                        >
                          <Minus size={14} />
                        </button>
                        <span style={{ fontSize: '0.85rem', fontWeight: '700', minWidth: '24px', textAlign: 'center' }}>
                          {detailMode === 'hire' ? `${detailDays}d` : `${detailQuantity}x`}
                        </span>
                        <button 
                          onClick={() => {
                            if (detailMode === 'hire') {
                              setDetailDays(prev => prev + 1);
                            } else {
                              setDetailQuantity(prev => prev + 1);
                            }
                          }}
                          style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748b' }}
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Detail tab toggle */}
                    <div style={{
                      display: 'flex', borderBottom: '1px solid var(--border-light)',
                      marginBottom: '16px', gap: '20px'
                    }}>
                      <button 
                        onClick={() => setActiveDetailTab('desc')}
                        style={{
                          background: 'transparent', border: 'none', padding: '10px 0',
                          fontSize: '0.85rem', fontWeight: '700', cursor: 'pointer',
                          color: activeDetailTab === 'desc' ? 'var(--primary)' : 'var(--text-muted)',
                          position: 'relative'
                        }}
                      >
                        <span>Description</span>
                        {activeDetailTab === 'desc' && <div className="tab-active-indicator" />}
                      </button>
                      <button 
                        onClick={() => setActiveDetailTab('specs')}
                        style={{
                          background: 'transparent', border: 'none', padding: '10px 0',
                          fontSize: '0.85rem', fontWeight: '700', cursor: 'pointer',
                          color: activeDetailTab === 'specs' ? 'var(--primary)' : 'var(--text-muted)',
                          position: 'relative'
                        }}
                      >
                        <span>Specifications</span>
                        {activeDetailTab === 'specs' && <div className="tab-active-indicator" />}
                      </button>
                      <button 
                        onClick={() => setActiveDetailTab('policy')}
                        style={{
                          background: 'transparent', border: 'none', padding: '10px 0',
                          fontSize: '0.85rem', fontWeight: '700', cursor: 'pointer',
                          color: activeDetailTab === 'policy' ? 'var(--primary)' : 'var(--text-muted)',
                          position: 'relative'
                        }}
                      >
                        <span>Rental Terms</span>
                        {activeDetailTab === 'policy' && <div className="tab-active-indicator" />}
                      </button>
                    </div>

                    {/* Tab panels info */}
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '24px' }}>
                      {activeDetailTab === 'desc' && (
                        <p>{selectedCar.description}</p>
                      )}

                      {activeDetailTab === 'specs' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
                            <span style={{ fontWeight: '600' }}>Engine Unit</span>
                            <span style={{ color: 'var(--text-main)' }}>{selectedCar.specs.engine}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
                            <span style={{ fontWeight: '600' }}>Total Horsepower</span>
                            <span style={{ color: 'var(--text-main)' }}>{selectedCar.specs.horsepower}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
                            <span style={{ fontWeight: '600' }}>Fuel Option</span>
                            <span style={{ color: 'var(--text-main)' }}>{selectedCar.specs.fuel}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
                            <span style={{ fontWeight: '600' }}>Transmission Gearbox</span>
                            <span style={{ color: 'var(--text-main)' }}>{selectedCar.specs.transmission}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
                            <span style={{ fontWeight: '600' }}>Luggage Capacity</span>
                            <span style={{ color: 'var(--text-main)' }}>{selectedCar.specs.luggage} bags</span>
                          </div>
                        </div>
                      )}

                      {activeDetailTab === 'policy' && (
                        <p>{selectedCar.policy}</p>
                      )}
                    </div>

                  </div>
                </div>

                {/* STICKY BOTTOM RESERVATION BAR */}
                <div style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0,
                  background: 'rgba(255,255,255,0.95)',
                  backdropFilter: 'blur(10px)',
                  borderTop: '1px solid var(--border-light)',
                  padding: '12px 16px',
                  display: 'flex', gap: '10px',
                  zIndex: 101
                }}>
                  <button 
                    onClick={() => {
                      addToCart(selectedCar, detailMode, detailMode === 'hire' ? detailDays : detailQuantity);
                      setSelectedCar(null);
                    }}
                    style={{
                      flex: 1, background: '#0f172a', color: 'white',
                      border: 'none', borderRadius: '14px', padding: '12px 0',
                      fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                      transition: 'var(--transition)'
                    }}
                  >
                    <ShoppingBag size={16} />
                    <span>Add to Enquiry</span>
                  </button>

                  <a 
                    href={generateSingleWhatsAppMessage(selectedCar, detailMode, detailDays, detailQuantity)}
                    target="_blank"
                    rel="noreferrer"
                    className="animate-pulse-green"
                    style={{
                      flex: 1.2, background: 'var(--success)', color: 'white',
                      border: 'none', borderRadius: '14px', padding: '12px 0',
                      fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                      textDecoration: 'none', textAlign: 'center'
                    }}
                  >
                    <MessageSquare size={16} fill="white" />
                    <span>Book on WhatsApp</span>
                  </a>
                </div>

              </div>
            )}

          </div>
        </div>
      </div>
    </>
  );
}
