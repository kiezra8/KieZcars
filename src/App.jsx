import React, { useState, useEffect } from 'react';
import { 
  Car, Compass, Layers, TrendingUp, Gem, Key, 
  Search, ShoppingBag, User, Heart, Trash2, Plus, 
  Minus, ChevronLeft, Phone, MessageSquare, Check, 
  MapPin, Info, Calendar, DollarSign, ExternalLink, 
  Share2, Shield, Users, Briefcase, Gauge, Droplet, Star,
  Zap, Truck, Sun, Sparkles, X, ChevronRight, CheckCircle2
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
  const [isChatOpen, setIsChatOpen] = useState(false);
  
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
      desc: "Drive Land Cruiser V8, Tesla, & Range Rover from 250,000 Ugshs/day.",
      image: "https://images.unsplash.com/photo-1606016159991-dfe4f974be5c?auto=format&fit=crop&q=80&w=800",
      category: "Elite Rentals"
    },
    {
      title: "Buy Your Dream Vehicle Today",
      desc: "Top certified luxury and standard cars in Kampala in pristine condition.",
      image: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80&w=800",
      category: "Certified Sales"
    },
    {
      title: "Eco-Friendly Electric Future",
      desc: "Go green with high-end Tesla & Plug-In Hybrid innovations.",
      image: "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&q=80&w=800",
      category: "Electric EVs"
    }
  ];

  const DEPOSIT = 800000; // 800,000 Ugshs standard refundable security deposit

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

  // Ugandan Shilling formatting utility
  const formatUgshs = (num) => {
    return num.toLocaleString() + ' Ugshs';
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
      return matchesSearch && car.category === selectedCategory;
    });
  };

  // WhatsApp formatted enquiry string (Phone number hidden in URL)
  const getWhatsAppLink = (text) => {
    return `https://wa.me/256702370441?text=${encodeURIComponent(text)}`;
  };

  const generateSingleWhatsAppMessage = (car, mode, days, qty) => {
    let text = `Hello KieZcars! 👋\n\nI am interested in ordering the following vehicle:\n`;
    text += `🚗 *${car.name}*\n`;
    text += `• Category: ${car.category}\n`;
    text += `• Option: ${mode === 'hire' ? 'Rental / Car Hire' : 'Outright Purchase'}\n`;
    
    if (mode === 'hire') {
      text += `• Duration: ${days} days\n`;
      text += `• Daily rate: ${formatUgshs(car.priceHire)}\n`;
      text += `• Rental Subtotal: ${formatUgshs(car.priceHire * days)}\n`;
      text += `• Refundable Deposit: ${formatUgshs(DEPOSIT)}\n`;
      text += `*Total Estimate: ${formatUgshs((car.priceHire * days) + DEPOSIT)}*`;
    } else {
      text += `• Quantity: ${qty} unit(s)\n`;
      text += `• Unit Price: ${formatUgshs(car.priceSale)}\n`;
      text += `*Grand Total: ${formatUgshs(car.priceSale * qty)}*`;
    }
    
    text += `\n\nPlease confirm availability and details. Thank you!`;
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
        text += `   • Rate: ${formatUgshs(car.priceHire)}/day × ${item.days} days = ${formatUgshs(sub)}\n`;
        grandTotal += sub;
      } else {
        const sub = car.priceSale * item.quantity;
        text += `   • Price: ${formatUgshs(car.priceSale)} × ${item.quantity} = ${formatUgshs(sub)}\n`;
        grandTotal += sub;
      }
    });
    
    text += `\n*Refundable Security Deposit: ${formatUgshs(DEPOSIT)}*\n`;
    text += `*Total Estimated Amount: ${formatUgshs(grandTotal + DEPOSIT)}*\n\n`;
    text += `Please verify availability and advise on pickup/delivery.`;
    return getWhatsAppLink(text);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setActiveTab('allcars');
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

  // Render proper icon for category
  const renderCategoryIcon = (catId, size = 18) => {
    const iconMap = {
      SUV: Compass,
      Luxury: Gem,
      Sports: Gauge,
      Sedan: Layers,
      Hatchback: TrendingUp,
      Electric: Zap,
      Hybrid: Droplet,
      Pickup: Truck,
      Convertible: Sun,
      Minivan: Users
    };
    const IconComponent = iconMap[catId] || Car;
    return <IconComponent size={size} />;
  };

  const trendingCars = CAR_DATA.filter(car => 
    car.id === 'toyota-land-cruiser-v8' || 
    car.id === 'mercedes-benz-s-class' || 
    car.id === 'porsche-911-cabriolet' ||
    car.id === 'range-rover-sport'
  );

  return (
    <>
      {/* Visual Canvas flanking emulator */}
      <div className="desktop-bg-canvas">
        <div className="desktop-info-card">
          <div className="brand-feature-badge">
            <Sparkles size={16} style={{ color: 'var(--primary)' }} /> Kampala's Ultimate Showroom
          </div>
          <h1>KieZcars</h1>
          <p>
            Experience premium car sales and elite car hire rentals. Book seamlessly via WhatsApp without online credit cards.
            Fully responsive, elegant glassmorphism and animated components.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: '18px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <h4 style={{ color: 'var(--primary)', fontSize: '1.1rem', marginBottom: '4px' }}>Ugshs Pricing</h4>
              <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Fully formatted in Ugandan Shillings</span>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: '18px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <h4 style={{ color: 'var(--primary)', fontSize: '1.1rem', marginBottom: '4px' }}>Hidden Secure Hotline</h4>
              <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Secure WhatsApp & Call connections</span>
            </div>
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          {/* Main App Container */}
          <div className="app-emulator-container">
            
            {/* Sticky Header with Company Name */}
            <header style={{
              background: 'rgba(15, 22, 38, 0.85)',
              backdropFilter: 'blur(12px)',
              position: 'sticky',
              top: 0,
              zIndex: 50,
              padding: '14px 16px',
              borderBottom: '1px solid var(--border-light)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div onClick={() => { setActiveTab('home'); setSelectedCategory('all'); }} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                  <div style={{
                    background: 'linear-gradient(135deg, var(--primary) 0%, #ff8b70 100%)',
                    color: 'white',
                    padding: '8px',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 15px rgba(255, 87, 51, 0.3)'
                  }}>
                    <Car size={20} />
                  </div>
                  <div>
                    <span style={{ fontWeight: '800', fontSize: '1.4rem', letterSpacing: '-0.04em', color: 'white', display: 'block', lineHeight: '1.1' }}>
                      KieZ<span style={{ color: 'var(--primary)' }}>cars</span>
                    </span>
                    <span style={{ fontSize: '0.62rem', fontWeight: '700', color: 'var(--text-muted)', letterSpacing: '0.12em' }}>
                      KAMPALA'S ELITE FLEET
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <button 
                    onClick={() => setActiveTab('favorites')}
                    style={{ 
                      position: 'relative', 
                      background: 'rgba(255,255,255,0.03)', 
                      border: '1px solid var(--border-light)', 
                      borderRadius: '12px',
                      cursor: 'pointer', 
                      padding: '8px', 
                      color: '#94a3b8',
                      transition: 'var(--transition)'
                    }}
                  >
                    <Heart size={18} fill={favorites.length > 0 ? "var(--danger)" : "none"} color={favorites.length > 0 ? "var(--danger)" : "#94a3b8"} />
                    {favorites.length > 0 && (
                      <span style={{
                        position: 'absolute', top: -3, right: -3,
                        background: 'var(--danger)', color: 'white',
                        fontSize: '0.6rem', fontWeight: '800',
                        width: '16px', height: '16px', borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>{favorites.length}</span>
                    )}
                  </button>

                  <button 
                    onClick={() => setActiveTab('cart')}
                    style={{ 
                      position: 'relative', 
                      background: 'rgba(255,255,255,0.03)', 
                      border: '1px solid var(--border-light)', 
                      borderRadius: '12px',
                      cursor: 'pointer', 
                      padding: '8px', 
                      color: '#94a3b8',
                      transition: 'var(--transition)'
                    }}
                  >
                    <ShoppingBag size={18} color={cart.length > 0 ? "var(--primary)" : "#94a3b8"} />
                    {cart.length > 0 && (
                      <span style={{
                        position: 'absolute', top: -3, right: -3,
                        background: 'var(--primary)', color: 'white',
                        fontSize: '0.6rem', fontWeight: '800',
                        width: '16px', height: '16px', borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>{cart.length}</span>
                    )}
                  </button>
                </div>
              </div>

              {/* Decorative Driving Car Micro-Interaction (Animation #3) */}
              <div style={{ position: 'relative', width: '100%', height: '4px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '2px', overflow: 'hidden' }}>
                <div className="animate-car-drive" style={{ position: 'absolute', top: -6, color: 'var(--primary)', width: '20px' }}>
                  <Car size={10} fill="var(--primary)" />
                </div>
              </div>

              {/* Search bar input */}
              <form onSubmit={handleSearchSubmit} style={{ position: 'relative', width: '100%' }}>
                <input 
                  type="text"
                  placeholder="Search Rover, Land Cruiser, EV hybrids..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    paddingLeft: '40px',
                    height: '40px',
                    borderRadius: '12px',
                    border: '1px solid var(--border-light)',
                    fontSize: '0.85rem',
                    background: 'rgba(255, 255, 255, 0.03)',
                    color: 'white'
                  }}
                />
                <Search size={16} style={{ position: 'absolute', left: '14px', top: '12px', color: 'var(--text-muted)' }} />
                {searchQuery && (
                  <button 
                    type="button" 
                    onClick={() => setSearchQuery('')}
                    style={{ position: 'absolute', right: '14px', top: '11px', border: 'none', background: 'transparent', color: '#94a3b8', fontSize: '0.78rem', cursor: 'pointer' }}
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
                top: '125px', left: '50%', transform: 'translateX(-50%)',
                background: '#090d16', color: 'white',
                border: '1px solid rgba(18, 161, 80, 0.3)',
                padding: '10px 18px', borderRadius: '20px',
                fontSize: '0.82rem', fontWeight: '600',
                display: 'flex', alignItems: 'center', gap: '8px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                zIndex: 99,
                animation: 'fadeIn 0.25s ease-out'
              }}>
                <CheckCircle2 size={16} color="#12a150" strokeWidth={3} />
                <span>{successToast}</span>
              </div>
            )}

            {/* Scrollable Core Screens */}
            <main style={{ flex: 1, overflowY: 'auto', paddingBottom: '30px', background: 'var(--bg-main)' }}>
              
              {/* SCREEN: HOME */}
              {activeTab === 'home' && (
                <div className="animate-slide-up-fade">
                  
                  {/* Hero carousel (Animation #1 - Auto Rotating text slide up) */}
                  <div style={{ position: 'relative', width: '100%', height: '185px', overflow: 'hidden' }}>
                    <div style={{
                      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                      backgroundImage: `url(${slides[currentSlide].image})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      filter: 'brightness(0.5) contrast(1.1)',
                      transition: 'background-image 0.8s ease-in-out'
                    }} />
                    
                    {/* Linear glass overlay */}
                    <div style={{
                      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                      background: 'linear-gradient(to top, var(--bg-main) 0%, rgba(11, 15, 25, 0.1) 100%)'
                    }} />
                    
                    <div style={{
                      position: 'relative', height: '100%', padding: '24px 20px',
                      display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', color: 'white'
                    }}>
                      <div style={{
                        background: 'rgba(255, 87, 51, 0.15)', border: '1px solid rgba(255, 87, 51, 0.3)',
                        color: '#ff8b70', fontSize: '0.62rem', fontWeight: '800', width: 'fit-content',
                        padding: '3px 8px', borderRadius: '6px', marginBottom: '8px', letterSpacing: '0.08em'
                      }}>
                        {slides[currentSlide].category.toUpperCase()}
                      </div>
                      
                      {/* slideUp animation on state transition */}
                      <h2 key={currentSlide} style={{ 
                        fontSize: '1.3rem', 
                        fontWeight: '800', 
                        marginBottom: '4px', 
                        textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                        animation: 'slideUpFade 0.5s ease-out forwards'
                      }}>
                        {slides[currentSlide].title}
                      </h2>
                      <p style={{ 
                        fontSize: '0.8rem', 
                        color: '#cbd5e1', 
                        textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                        lineHeight: '1.3'
                      }}>
                        {slides[currentSlide].desc}
                      </p>
                    </div>

                    {/* Dots indicator */}
                    <div style={{ position: 'absolute', bottom: '16px', right: '20px', display: 'flex', gap: '6px', zIndex: 12 }}>
                      {slides.map((_, i) => (
                        <div 
                          key={i}
                          onClick={() => setCurrentSlide(i)}
                          style={{
                            width: currentSlide === i ? '20px' : '6px',
                            height: '6px',
                            borderRadius: '3px',
                            background: currentSlide === i ? 'var(--primary)' : 'rgba(255,255,255,0.4)',
                            cursor: 'pointer',
                            transition: 'var(--transition)'
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Categories Header & Grid (ALL 10 SEEN ON HOME SCREEN) */}
                  <div style={{ padding: '24px 16px 16px 16px' }}>
                    <h3 style={{ 
                      fontSize: '1rem', 
                      fontWeight: '800', 
                      color: 'white', 
                      marginBottom: '14px', 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      letterSpacing: '-0.01em'
                    }}>
                      <span>Explore Luxury Categories</span>
                      <span 
                        onClick={() => { setSelectedCategory('all'); setActiveTab('allcars'); }} 
                        style={{ color: 'var(--primary)', fontSize: '0.78rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px' }}
                      >
                        Reset Filter <ChevronRight size={14} />
                      </span>
                    </h3>
                    
                    {/* Beautiful 5x2 grid showing exactly 10 categories (Animation #2 - Card lift on hover) */}
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(5, 1fr)', 
                      gridTemplateRows: 'repeat(2, auto)',
                      gap: '12px 6px' 
                    }}>
                      {CATEGORIES.map((cat) => {
                        const isSelected = selectedCategory === cat.id;
                        return (
                          <div 
                            key={cat.id} 
                            onClick={() => {
                              setSelectedCategory(cat.id);
                              // Smooth scroll to the All Cars listing below
                              const el = document.getElementById('all-cars-anchor');
                              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            }}
                            className="category-item"
                            style={{
                              display: 'flex', 
                              flexDirection: 'column', 
                              alignItems: 'center', 
                              gap: '6px', 
                              cursor: 'pointer',
                            }}
                          >
                            <div 
                              className="category-icon-wrapper"
                              style={{
                                width: '48px', height: '48px',
                                borderRadius: '16px',
                                background: isSelected ? 'var(--primary)' : 'rgba(255, 255, 255, 0.03)',
                                border: isSelected ? '1px solid var(--primary)' : '1px solid rgba(255, 255, 255, 0.05)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: isSelected ? '0 4px 12px rgba(255, 87, 51, 0.25)' : 'var(--shadow-sm)',
                                color: isSelected ? 'white' : 'var(--primary)',
                                transition: 'var(--transition)'
                              }}
                            >
                              {renderCategoryIcon(cat.id, 20)}
                            </div>
                            <span style={{ 
                              fontSize: '0.68rem', 
                              fontWeight: isSelected ? '700' : '600', 
                              color: isSelected ? 'white' : 'var(--text-muted)', 
                              textAlign: 'center', 
                              whiteSpace: 'nowrap', 
                              overflow: 'hidden', 
                              textOverflow: 'ellipsis', 
                              width: '100%',
                              transition: 'var(--transition)'
                            }}>
                              {cat.name}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Trending Rides Section */}
                  <div style={{ padding: '8px 16px 20px 16px' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: '800', color: 'white', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Sparkles size={16} style={{ color: 'var(--primary)' }} /> Trending Rides
                    </h3>
                    
                    {/* Horizontal scroll track */}
                    <div style={{ 
                      display: 'flex', 
                      gap: '14px', 
                      overflowX: 'auto', 
                      paddingBottom: '10px',
                      scrollSnapType: 'x mandatory'
                    }}>
                      {trendingCars.map((car) => (
                        <div 
                          key={car.id} 
                          className="premium-card"
                          onClick={() => { setSelectedCar(car); setDetailMode(car.isHire ? 'hire' : 'buy'); }}
                          style={{
                            minWidth: '240px',
                            width: '240px',
                            background: 'rgba(22, 30, 49, 0.65)',
                            borderRadius: '24px',
                            overflow: 'hidden',
                            position: 'relative',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            scrollSnapAlign: 'start',
                            flexShrink: 0
                          }}
                        >
                          {/* Wishlist Heart */}
                          <button 
                            onClick={(e) => toggleFavorite(car.id, e)}
                            style={{
                              position: 'absolute', top: '12px', right: '12px',
                              width: '30px', height: '30px', borderRadius: '50%',
                              background: 'rgba(9, 13, 22, 0.7)',
                              backdropFilter: 'blur(4px)',
                              border: '1px solid rgba(255, 255, 255, 0.08)', 
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              zIndex: 10, cursor: 'pointer', color: '#94a3b8'
                            }}
                          >
                            <Heart size={14} fill={favorites.includes(car.id) ? "var(--danger)" : "none"} color={favorites.includes(car.id) ? "var(--danger)" : "#94a3b8"} />
                          </button>

                          {/* Badge tag */}
                          <span className={`card-badge ${car.isHire && !car.isSale ? 'hire' : 'sale'}`}>
                            {car.category}
                          </span>

                          <div style={{ width: '100%', height: '125px', overflow: 'hidden' }}>
                            <img src={car.images[0]} alt={car.name} className="premium-card-img" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>

                          <div style={{ padding: '14px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
                                <Star size={11} fill="var(--warning)" color="var(--warning)" />
                                <span style={{ fontSize: '0.72rem', fontWeight: '800', color: 'white' }}>{car.rating}</span>
                                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>({car.reviewsCount})</span>
                              </div>

                              <h4 style={{ fontSize: '0.85rem', fontWeight: '800', lineHeight: '1.2', color: 'white', marginBottom: '8px' }}>
                                {car.name}
                              </h4>
                            </div>

                            <div>
                              <div style={{ display: 'flex', gap: '8px', fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}><Users size={11} /> {car.specs.passengers} Seats</span>
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}><Gauge size={11} /> {car.specs.transmission[0]}A</span>
                              </div>

                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '10px' }}>
                                <div>
                                  {car.isHire && (
                                    <div style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--primary)' }}>
                                      {formatUgshs(car.priceHire)}<span style={{ fontSize: '0.62rem', fontWeight: '500', color: 'var(--text-muted)' }}>/day</span>
                                    </div>
                                  )}
                                  {car.isSale && !car.isHire && (
                                    <div style={{ fontSize: '0.85rem', fontWeight: '800', color: 'white' }}>
                                      {formatUgshs(car.priceSale)}
                                    </div>
                                  )}
                                </div>
                                
                                {/* Small Order Button */}
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedCar(car);
                                    setDetailMode(car.isHire ? 'hire' : 'buy');
                                  }}
                                  style={{
                                    background: 'var(--primary)',
                                    color: 'white',
                                    borderRadius: '10px',
                                    border: 'none',
                                    padding: '5px 10px',
                                    fontSize: '0.68rem',
                                    fontWeight: '800',
                                    cursor: 'pointer',
                                    boxShadow: '0 4px 10px rgba(255, 87, 51, 0.2)',
                                    transition: 'var(--transition)'
                                  }}
                                >
                                  Order
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* All Cars Section */}
                  <div id="all-cars-anchor" style={{ padding: '0 16px 20px 16px' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: '800', color: 'white', marginBottom: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>All Cars & Fleet</span>
                      {selectedCategory !== 'all' && (
                        <span style={{ fontSize: '0.72rem', color: 'var(--primary)', fontWeight: '700' }}>
                          Filtered: {selectedCategory}
                        </span>
                      )}
                    </h3>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                      {getFilteredCars().map((car) => (
                        <div 
                          key={car.id} 
                          className="premium-card"
                          onClick={() => { setSelectedCar(car); setDetailMode(car.isHire ? 'hire' : 'buy'); }}
                          style={{
                            borderRadius: '20px',
                            overflow: 'hidden',
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
                              background: 'rgba(9, 13, 22, 0.7)',
                              border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
                              zIndex: 10, cursor: 'pointer', color: '#94a3b8'
                            }}
                          >
                            <Heart size={13} fill={favorites.includes(car.id) ? "var(--danger)" : "none"} color={favorites.includes(car.id) ? "var(--danger)" : "#94a3b8"} />
                          </button>

                          {/* Badge tag */}
                          <span className={`card-badge ${car.isHire && !car.isSale ? 'hire' : 'sale'}`}>
                            {car.category}
                          </span>

                          <div style={{ width: '100%', height: '110px', overflow: 'hidden' }}>
                            <img src={car.images[0]} alt={car.name} className="premium-card-img" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>

                          <div style={{ padding: '10px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '3px', marginBottom: '4px' }}>
                                <Star size={10} fill="var(--warning)" color="var(--warning)" />
                                <span style={{ fontSize: '0.68rem', fontWeight: '700', color: 'white' }}>{car.rating}</span>
                              </div>

                              <h4 style={{ fontSize: '0.78rem', fontWeight: '800', lineHeight: '1.2', color: 'white', marginBottom: '6px' }}>
                                {car.name}
                              </h4>
                            </div>

                            <div>
                              <div style={{ display: 'flex', gap: '4px', fontSize: '0.62rem', color: 'var(--text-muted)', marginBottom: '8px', flexWrap: 'wrap' }}>
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '1px' }}><Gauge size={9} />{car.specs.horsepower}</span>
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '1px' }}><Droplet size={9} />{car.specs.fuel}</span>
                              </div>

                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '8px' }}>
                                <div style={{ maxWidth: '65%', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {car.isHire && (
                                    <div style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--primary)', whiteSpace: 'nowrap' }}>
                                      {formatUgshs(car.priceHire)}<span style={{ fontSize: '0.55rem', fontWeight: '500', color: 'var(--text-muted)' }}>/d</span>
                                    </div>
                                  )}
                                  {car.isSale && !car.isHire && (
                                    <div style={{ fontSize: '0.75rem', fontWeight: '800', color: 'white', whiteSpace: 'nowrap' }}>
                                      {formatUgshs(car.priceSale)}
                                    </div>
                                  )}
                                </div>
                                
                                {/* Small Order Button */}
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedCar(car);
                                    setDetailMode(car.isHire ? 'hire' : 'buy');
                                  }}
                                  style={{
                                    background: 'var(--primary)',
                                    color: 'white',
                                    borderRadius: '8px',
                                    border: 'none',
                                    padding: '4px 8px',
                                    fontSize: '0.65rem',
                                    fontWeight: '800',
                                    cursor: 'pointer',
                                    boxShadow: '0 3px 6px rgba(255, 87, 51, 0.15)',
                                    transition: 'var(--transition)'
                                  }}
                                >
                                  Order
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Booking Guarantee Banner */}
                  <div style={{ padding: '0 16px 10px 16px' }}>
                    <div style={{
                      background: 'linear-gradient(135deg, #161e31 0%, #0d1220 100%)',
                      borderRadius: '24px', padding: '16px', color: 'white',
                      display: 'flex', alignItems: 'center', gap: '16px',
                      border: '1px solid rgba(255,255,255,0.05)',
                      boxShadow: 'var(--shadow-md)'
                    }}>
                      <div style={{
                        background: 'rgba(255, 87, 51, 0.12)', color: 'var(--primary)',
                        padding: '12px', borderRadius: '18px'
                      }}>
                        <Shield size={24} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ fontSize: '0.85rem', fontWeight: '700', marginBottom: '3px' }}>WhatsApp Direct Booking</h4>
                        <p style={{ fontSize: '0.7rem', color: '#94a3b8', lineHeight: '1.4' }}>
                          Kampala's most secure luxury car service. No online deposits. Confirm booking via direct WhatsApp in 10 minutes.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SCREEN: CATEGORIES TAB */}
              {activeTab === 'categories' && (
                <div className="animate-slide-up-fade" style={{ padding: '16px 0' }}>
                  
                  {/* Horizontal Scroll Category Chips */}
                  <div style={{
                    display: 'flex', gap: '8px', overflowX: 'auto',
                    padding: '0 16px 14px 16px',
                    whiteSpace: 'nowrap',
                    borderBottom: '1px solid var(--border-light)'
                  }}>
                    <button
                      onClick={() => setSelectedCategory('all')}
                      style={{
                        background: selectedCategory === 'all' ? 'var(--primary)' : 'rgba(255,255,255,0.03)',
                        color: selectedCategory === 'all' ? 'white' : 'var(--text-muted)',
                        border: selectedCategory === 'all' ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.05)',
                        padding: '8px 16px',
                        borderRadius: '99px',
                        fontSize: '0.78rem',
                        fontWeight: '700',
                        cursor: 'pointer',
                        transition: 'var(--transition)'
                      }}
                    >
                      All Cars
                    </button>
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        style={{
                          background: selectedCategory === cat.id ? 'var(--primary)' : 'rgba(255,255,255,0.03)',
                          color: selectedCategory === cat.id ? 'white' : 'var(--text-muted)',
                          border: selectedCategory === cat.id ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.05)',
                          padding: '8px 16px',
                          borderRadius: '99px',
                          fontSize: '0.78rem',
                          fontWeight: '700',
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
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Showing <b>{getFilteredCars().length}</b> luxury vehicles
                    </span>
                    {searchQuery && (
                      <span style={{ fontSize: '0.78rem', color: 'var(--primary)' }}>
                        Query: "{searchQuery}"
                      </span>
                    )}
                  </div>

                  {/* Grid list of Category Filtered Cars */}
                  <div style={{ padding: '0 16px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                    {getFilteredCars().length > 0 ? (
                      getFilteredCars().map((car) => (
                        <div 
                          key={car.id} 
                          className="premium-card"
                          onClick={() => { setSelectedCar(car); setDetailMode(car.isHire ? 'hire' : 'buy'); }}
                          style={{
                            borderRadius: '20px',
                            overflow: 'hidden',
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
                              background: 'rgba(9, 13, 22, 0.7)',
                              border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
                              zIndex: 10, cursor: 'pointer', color: '#94a3b8'
                            }}
                          >
                            <Heart size={13} fill={favorites.includes(car.id) ? "var(--danger)" : "none"} color={favorites.includes(car.id) ? "var(--danger)" : "#94a3b8"} />
                          </button>

                          <span className={`card-badge ${car.isHire && !car.isSale ? 'hire' : 'sale'}`}>
                            {car.category}
                          </span>

                          <div style={{ width: '100%', height: '110px', overflow: 'hidden' }}>
                            <img src={car.images[0]} alt={car.name} className="premium-card-img" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>

                          <div style={{ padding: '10px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '3px', marginBottom: '4px' }}>
                                <Star size={10} fill="var(--warning)" color="var(--warning)" />
                                <span style={{ fontSize: '0.68rem', fontWeight: '700', color: 'white' }}>{car.rating}</span>
                              </div>

                              <h4 style={{ fontSize: '0.78rem', fontWeight: '800', lineHeight: '1.2', color: 'white', marginBottom: '6px' }}>
                                {car.name}
                              </h4>
                            </div>

                            <div>
                              <div style={{ display: 'flex', gap: '4px', fontSize: '0.62rem', color: 'var(--text-muted)', marginBottom: '8px', flexWrap: 'wrap' }}>
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '1px' }}><Users size={9} /> {car.specs.passengers} seats</span>
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '1px' }}><Gauge size={9} /> {car.specs.transmission[0]}A</span>
                              </div>

                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '8px' }}>
                                <div style={{ maxWidth: '65%', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {car.isHire && (
                                    <div style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--primary)', whiteSpace: 'nowrap' }}>
                                      {formatUgshs(car.priceHire)}<span style={{ fontSize: '0.55rem', fontWeight: '500', color: 'var(--text-muted)' }}>/d</span>
                                    </div>
                                  )}
                                  {car.isSale && !car.isHire && (
                                    <div style={{ fontSize: '0.75rem', fontWeight: '800', color: 'white', whiteSpace: 'nowrap' }}>
                                      {formatUgshs(car.priceSale)}
                                    </div>
                                  )}
                                </div>
                                
                                {/* Small Order Button */}
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedCar(car);
                                    setDetailMode(car.isHire ? 'hire' : 'buy');
                                  }}
                                  style={{
                                    background: 'var(--primary)',
                                    color: 'white',
                                    borderRadius: '8px',
                                    border: 'none',
                                    padding: '4px 8px',
                                    fontSize: '0.65rem',
                                    fontWeight: '800',
                                    cursor: 'pointer',
                                    boxShadow: '0 3px 6px rgba(255, 87, 51, 0.15)',
                                    transition: 'var(--transition)'
                                  }}
                                >
                                  Order
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div style={{ gridColumn: 'span 2', textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                        <Car size={36} style={{ color: 'rgba(255,255,255,0.1)', marginBottom: '10px' }} />
                        <h4 style={{ color: 'white', marginBottom: '4px', fontSize: '0.9rem' }}>No Cars Found</h4>
                        <p style={{ fontSize: '0.75rem' }}>No vehicles match your query. Try broadening your keywords!</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* SCREEN: ALL CARS TAB */}
              {activeTab === 'allcars' && (
                <div className="animate-slide-up-fade" style={{ padding: '16px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'white', marginBottom: '4px' }}>
                    Showroom Catalog
                  </h3>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                    Full inventory of premium rental vehicles and certified purchase fleet in Kampala.
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                    {CAR_DATA.map((car) => (
                      <div 
                        key={car.id} 
                        className="premium-card"
                        onClick={() => { setSelectedCar(car); setDetailMode(car.isHire ? 'hire' : 'buy'); }}
                        style={{
                          borderRadius: '20px',
                          overflow: 'hidden',
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
                            background: 'rgba(9, 13, 22, 0.7)',
                            border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            zIndex: 10, cursor: 'pointer', color: '#94a3b8'
                          }}
                        >
                          <Heart size={13} fill={favorites.includes(car.id) ? "var(--danger)" : "none"} color={favorites.includes(car.id) ? "var(--danger)" : "#94a3b8"} />
                        </button>

                        <span className={`card-badge ${car.isHire && !car.isSale ? 'hire' : 'sale'}`}>
                          {car.category}
                        </span>

                        <div style={{ width: '100%', height: '110px', overflow: 'hidden' }}>
                          <img src={car.images[0]} alt={car.name} className="premium-card-img" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>

                        <div style={{ padding: '10px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '3px', marginBottom: '4px' }}>
                              <Star size={10} fill="var(--warning)" color="var(--warning)" />
                              <span style={{ fontSize: '0.68rem', fontWeight: '700', color: 'white' }}>{car.rating}</span>
                            </div>

                            <h4 style={{ fontSize: '0.78rem', fontWeight: '800', lineHeight: '1.2', color: 'white', marginBottom: '6px' }}>
                              {car.name}
                            </h4>
                          </div>

                          <div>
                            <div style={{ display: 'flex', gap: '4px', fontSize: '0.62rem', color: 'var(--text-muted)', marginBottom: '8px', flexWrap: 'wrap' }}>
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '1px' }}><Gauge size={9} />{car.specs.horsepower}</span>
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '1px' }}><Droplet size={9} />{car.specs.fuel}</span>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '8px' }}>
                              <div style={{ maxWidth: '65%', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {car.isHire && (
                                  <div style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--primary)', whiteSpace: 'nowrap' }}>
                                    {formatUgshs(car.priceHire)}<span style={{ fontSize: '0.55rem', fontWeight: '500', color: 'var(--text-muted)' }}>/d</span>
                                  </div>
                                )}
                                {car.isSale && !car.isHire && (
                                  <div style={{ fontSize: '0.75rem', fontWeight: '800', color: 'white', whiteSpace: 'nowrap' }}>
                                    {formatUgshs(car.priceSale)}
                                  </div>
                                )}
                              </div>
                              
                              {/* Small Order Button */}
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedCar(car);
                                  setDetailMode(car.isHire ? 'hire' : 'buy');
                                }}
                                style={{
                                  background: 'var(--primary)',
                                  color: 'white',
                                  borderRadius: '8px',
                                  border: 'none',
                                  padding: '4px 8px',
                                  fontSize: '0.65rem',
                                  fontWeight: '800',
                                  cursor: 'pointer',
                                  boxShadow: '0 3px 6px rgba(255, 87, 51, 0.15)',
                                  transition: 'var(--transition)'
                                }}
                              >
                                Order
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SCREEN: FAVORITES */}
              {activeTab === 'favorites' && (
                <div className="animate-slide-up-fade" style={{ padding: '16px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'white', marginBottom: '4px' }}>
                    Your Showroom Showroom
                  </h3>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                    Compare and launch enquiries for your highly-desired luxury vehicles.
                  </p>

                  {favorites.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                      {CAR_DATA.filter(car => favorites.includes(car.id)).map((car) => (
                        <div 
                          key={car.id} 
                          className="premium-card"
                          onClick={() => { setSelectedCar(car); setDetailMode(car.isHire ? 'hire' : 'buy'); }}
                          style={{
                            borderRadius: '20px',
                            overflow: 'hidden',
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
                              background: 'rgba(9, 13, 22, 0.7)',
                              border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
                              zIndex: 10, cursor: 'pointer', color: '#94a3b8'
                            }}
                          >
                            <Heart size={13} fill="var(--danger)" color="var(--danger)" />
                          </button>

                          <div style={{ width: '100%', height: '110px', overflow: 'hidden' }}>
                            <img src={car.images[0]} alt={car.name} className="premium-card-img" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>

                          <div style={{ padding: '10px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                            <div>
                              <h4 style={{ fontSize: '0.78rem', fontWeight: '800', color: 'white', marginBottom: '6px' }}>
                                {car.name}
                              </h4>
                            </div>

                            <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '8px' }}>
                                <div>
                                  {car.isHire && (
                                    <div style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--primary)' }}>
                                      {formatUgshs(car.priceHire)}<span style={{ fontSize: '0.55rem', color: 'var(--text-muted)' }}>/d</span>
                                    </div>
                                  )}
                                  {car.isSale && !car.isHire && (
                                    <div style={{ fontSize: '0.75rem', fontWeight: '800', color: 'white' }}>
                                      {formatUgshs(car.priceSale)}
                                    </div>
                                  )}
                                </div>
                                
                                {/* Small Order Button */}
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedCar(car);
                                    setDetailMode(car.isHire ? 'hire' : 'buy');
                                  }}
                                  style={{
                                    background: 'var(--primary)',
                                    color: 'white',
                                    borderRadius: '8px',
                                    border: 'none',
                                    padding: '4px 8px',
                                    fontSize: '0.65rem',
                                    fontWeight: '800',
                                    cursor: 'pointer',
                                    boxShadow: '0 3px 6px rgba(255, 87, 51, 0.15)',
                                    transition: 'var(--transition)'
                                  }}
                                >
                                  Order
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
                      <Heart size={44} style={{ color: 'rgba(255,255,255,0.06)', marginBottom: '10px' }} />
                      <h4 style={{ color: 'white', marginBottom: '4px', fontSize: '0.9rem' }}>No Favorites Yet</h4>
                      <p style={{ fontSize: '0.75rem' }}>Tap the heart icons on cars to populate your personalized showroom list.</p>
                      <button 
                        onClick={() => setActiveTab('home')}
                        style={{
                          marginTop: '15px', background: 'var(--primary)', color: 'white',
                          border: 'none', padding: '8px 18px', borderRadius: '12px',
                          fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer'
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
                <div className="animate-slide-up-fade" style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'white' }}>
                      Booking Enquiry Cart
                    </h3>
                    {cart.length > 0 && (
                      <button 
                        onClick={() => { setCart([]); triggerToast("Cleared all cart items"); }}
                        style={{ border: 'none', background: 'transparent', color: 'var(--danger)', fontSize: '0.78rem', fontWeight: '700', cursor: 'pointer' }}
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
                            background: 'rgba(255, 255, 255, 0.03)',
                            borderRadius: '20px',
                            border: '1px solid var(--border-light)',
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
                                <h4 style={{ fontSize: '0.82rem', fontWeight: '800', color: 'white', maxWidth: '85%' }}>
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
                                fontSize: '0.62rem', fontWeight: '800', padding: '2.5px 6px', borderRadius: '6px',
                                background: item.mode === 'hire' ? 'var(--primary-light)' : 'rgba(255, 255, 255, 0.05)',
                                color: item.mode === 'hire' ? 'var(--primary)' : 'white',
                                display: 'inline-block', marginTop: '4px', textTransform: 'uppercase'
                              }}>
                                {item.mode === 'hire' ? 'Rental Hire' : 'Buy Sale'}
                              </span>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                              <div style={{ fontSize: '0.85rem', fontWeight: '800', color: 'white' }}>
                                {formatUgshs(item.mode === 'hire' ? (item.car.priceHire * item.days) : (item.car.priceSale * item.quantity))}
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.03)', padding: '4px 8px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                                <button 
                                  onClick={() => updateCartQuantity(item.id, -1)}
                                  style={{ border: 'none', background: 'transparent', color: '#cbd5e1', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                                >
                                  <Minus size={13} />
                                </button>
                                <span style={{ fontSize: '0.78rem', fontWeight: '800', minWidth: '16px', textAlign: 'center', color: 'white' }}>
                                  {item.mode === 'hire' ? item.days : item.quantity}
                                </span>
                                <button 
                                  onClick={() => updateCartQuantity(item.id, 1)}
                                  style={{ border: 'none', background: 'transparent', color: '#cbd5e1', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                                >
                                  <Plus size={13} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Order Summary Card */}
                      <div style={{
                        background: 'rgba(255, 255, 255, 0.02)',
                        borderRadius: '24px',
                        border: '1px solid var(--border-light)',
                        padding: '16px',
                        marginTop: '10px'
                      }}>
                        <h4 style={{ fontSize: '0.85rem', fontWeight: '800', marginBottom: '12px', color: 'white' }}>Order Summary</h4>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Vehicles in Enquiry</span>
                            <span style={{ color: 'white' }}>{cart.length} vehicle(s)</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Refundable Security Deposit</span>
                            <span style={{ color: 'white' }}>{formatUgshs(DEPOSIT)}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed rgba(255,255,255,0.08)', paddingTop: '10px', fontSize: '0.9rem', fontWeight: '800', color: 'white' }}>
                            <span>Grand Total Estimate</span>
                            <span style={{ color: 'var(--primary)' }}>
                              {formatUgshs(cart.reduce((sum, item) => sum + (item.mode === 'hire' ? (item.car.priceHire * item.days) : (item.car.priceSale * item.quantity)), 0) + DEPOSIT)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Whatsapp Checkout Button */}
                      <a 
                        href={generateCartWhatsAppMessage()}
                        target="_blank"
                        rel="noreferrer"
                        className="animate-glow-pulse"
                        style={{
                          background: 'var(--success)', color: 'white',
                          padding: '16px', borderRadius: '16px',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                          fontWeight: '800', textDecoration: 'none', fontSize: '0.9rem',
                          textAlign: 'center', marginTop: '10px',
                          boxShadow: '0 4px 15px rgba(18, 161, 80, 0.3)'
                        }}
                      >
                        <MessageSquare size={18} fill="white" />
                        <span>Submit Booking via WhatsApp</span>
                      </a>
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
                      <ShoppingBag size={44} style={{ color: 'rgba(255,255,255,0.06)', marginBottom: '10px' }} />
                      <h4 style={{ color: 'white', marginBottom: '4px', fontSize: '0.9rem' }}>Cart is Empty</h4>
                      <p style={{ fontSize: '0.75rem' }}>Browse the showroom and add vehicles you want to hire or purchase.</p>
                      <button 
                        onClick={() => setActiveTab('home')}
                        style={{
                          marginTop: '15px', background: 'var(--primary)', color: 'white',
                          border: 'none', padding: '8px 18px', borderRadius: '12px',
                          fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer'
                        }}
                      >
                        Find a Car
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* SCREEN: ACCOUNT & PROFILE */}
              {activeTab === 'account' && (
                <div className="animate-slide-up-fade" style={{ padding: '16px' }}>
                  
                  {/* Profile Section */}
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.03)', borderRadius: '24px', padding: '20px',
                    border: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', alignItems: 'center',
                    marginBottom: '16px', textAlign: 'center'
                  }}>
                    <div style={{
                      width: '64px', height: '64px', borderRadius: '50%',
                      background: 'var(--primary-light)', color: 'var(--primary)',
                      border: '1px solid rgba(255, 87, 51, 0.2)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1.8rem', fontWeight: '800', marginBottom: '12px'
                    }}>
                      {userEmail ? userEmail[0].toUpperCase() : <User size={28} />}
                    </div>

                    {userEmail ? (
                      <div>
                        <h4 style={{ fontSize: '1rem', fontWeight: '800', color: 'white' }}>{userEmail}</h4>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>Active Showroom Member</span>
                        <button 
                          onClick={handleLogout}
                          style={{
                            marginTop: '12px', background: 'transparent', color: 'var(--danger)',
                            border: '1px solid var(--danger)', padding: '5px 12px', borderRadius: '8px',
                            fontSize: '0.72rem', fontWeight: '700', cursor: 'pointer',
                            transition: 'var(--transition)'
                          }}
                        >
                          Sign Out
                        </button>
                      </div>
                    ) : (
                      <form onSubmit={handleLogin} style={{ width: '100%' }}>
                        <h4 style={{ fontSize: '0.9rem', fontWeight: '800', marginBottom: '4px', color: 'white' }}>Welcome Guest User</h4>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '14px' }}>Sign in to save your wishlist and track your WhatsApp enquiries.</p>
                        
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
                              fontWeight: '700', cursor: 'pointer'
                            }}
                          >
                            Sign In
                          </button>
                        </div>
                      </form>
                    )}
                  </div>

                  {/* PWA offline installation instructions */}
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.03)', borderRadius: '24px', padding: '16px',
                    border: '1px solid var(--border-light)'
                  }}>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: '800', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px', color: 'white' }}>
                      <Info size={16} color="var(--primary)" /> 
                      PWA Installation Guide
                    </h4>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                        <div style={{ background: 'rgba(255,255,255,0.05)', color: 'white', width: '20px', height: '20px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', flexShrink: 0 }}>1</div>
                        <p><b>iOS Safari</b>: Tap the share icon <Share2 size={12} style={{ display: 'inline', verticalAlign: 'middle' }} /> at the bottom of Safari browser and click <b>"Add to Home Screen"</b>.</p>
                      </div>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                        <div style={{ background: 'rgba(255,255,255,0.05)', color: 'white', width: '20px', height: '20px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', flexShrink: 0 }}>2</div>
                        <p><b>Android Chrome</b>: Tap the vertical menu icon in the upper-right corner and select <b>"Install app"</b> or <b>"Add to Home screen"</b>.</p>
                      </div>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                        <div style={{ background: 'rgba(255,255,255,0.05)', color: 'white', width: '20px', height: '20px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', flexShrink: 0 }}>3</div>
                        <p>Enjoy instant loading, full-screen PWA interface, offline capabilities, and zero browser toolbar clutter!</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </main>

            {/* Bottom sticky navigation footer */}
            <footer style={{
              background: '#0d1322',
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
                <span style={{ fontSize: '0.62rem', fontWeight: '700' }}>Home</span>
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
                <span style={{ fontSize: '0.62rem', fontWeight: '700' }}>Categories</span>
              </button>

              {/* All Cars bottom nav tab */}
              <button 
                onClick={() => { setActiveTab('allcars'); setSelectedCategory('all'); }}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px',
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  color: activeTab === 'allcars' ? 'var(--primary)' : 'var(--text-muted)'
                }}
              >
                <Car size={20} />
                <span style={{ fontSize: '0.62rem', fontWeight: '700' }}>All Cars</span>
              </button>

              {/* Chat action tab (triggers beautiful bottom drawer, phone number completely hidden) */}
              <button 
                onClick={() => { setIsChatOpen(true); }}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px',
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  color: isChatOpen ? 'var(--primary)' : 'var(--text-muted)'
                }}
              >
                <MessageSquare size={20} />
                <span style={{ fontSize: '0.62rem', fontWeight: '700' }}>Chat</span>
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
                <span style={{ fontSize: '0.62rem', fontWeight: '700' }}>Account</span>
              </button>
            </footer>

            {/* FULL CAR PRODUCT DETAILS PAGE MODAL (Slides in over content) */}
            {selectedCar && (
              <div style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                background: '#090d16',
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
                  background: 'rgba(15, 22, 38, 0.9)',
                  backdropFilter: 'blur(10px)'
                }}>
                  <button 
                    onClick={() => setSelectedCar(null)}
                    style={{
                      background: 'transparent', border: 'none', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: '4px',
                      color: 'white', fontSize: '0.85rem', fontWeight: '700'
                    }}
                  >
                    <ChevronLeft size={20} />
                    <span>Back</span>
                  </button>

                  <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                    <button 
                      onClick={(e) => toggleFavorite(selectedCar.id, e)}
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
                    >
                      <Heart size={20} fill={favorites.includes(selectedCar.id) ? "var(--danger)" : "none"} color={favorites.includes(selectedCar.id) ? "var(--danger)" : "#94a3b8"} />
                    </button>
                  </div>
                </div>

                {/* Content Area */}
                <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '80px', background: 'var(--bg-main)' }}>
                  
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
                      <span style={{ fontSize: '0.82rem', fontWeight: '800', color: 'white' }}>{selectedCar.rating}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({selectedCar.reviewsCount} reviews)</span>
                    </div>

                    <h2 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'white', marginBottom: '14px' }}>
                      {selectedCar.name}
                    </h2>

                    {/* Spec badges grid */}
                    <div style={{
                      display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px',
                      background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '16px',
                      border: '1px solid var(--border-light)', marginBottom: '20px'
                    }}>
                      <div style={{ textAlign: 'center' }}>
                        <span style={{ fontSize: '0.58rem', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>ENG</span>
                        <span style={{ fontSize: '0.68rem', fontWeight: '700', color: 'white', wordBreak: 'break-word' }}>{selectedCar.specs.fuel}</span>
                      </div>
                      <div style={{ textAlign: 'center', borderLeft: '1px solid rgba(255,255,255,0.08)' }}>
                        <span style={{ fontSize: '0.58rem', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>SEAT</span>
                        <span style={{ fontSize: '0.72rem', fontWeight: '700', color: 'white' }}>{selectedCar.specs.passengers} Pls</span>
                      </div>
                      <div style={{ textAlign: 'center', borderLeft: '1px solid rgba(255,255,255,0.08)' }}>
                        <span style={{ fontSize: '0.58rem', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>GEAR</span>
                        <span style={{ fontSize: '0.68rem', fontWeight: '700', color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>{selectedCar.specs.transmission[0]}A</span>
                      </div>
                      <div style={{ textAlign: 'center', borderLeft: '1px solid rgba(255,255,255,0.08)' }}>
                        <span style={{ fontSize: '0.58rem', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>HP</span>
                        <span style={{ fontSize: '0.68rem', fontWeight: '700', color: 'white' }}>{selectedCar.specs.horsepower}</span>
                      </div>
                    </div>

                    {/* Mode selector (if both sell & hire available) */}
                    {selectedCar.isHire && selectedCar.isSale && (
                      <div style={{
                        display: 'flex', background: 'rgba(255,255,255,0.03)', padding: '4px',
                        borderRadius: '12px', marginBottom: '20px', border: '1px solid var(--border-light)'
                      }}>
                        <button 
                          onClick={() => setDetailMode('hire')}
                          style={{
                            flex: 1, padding: '8px', border: 'none', borderRadius: '10px',
                            background: detailMode === 'hire' ? 'var(--primary)' : 'transparent',
                            color: detailMode === 'hire' ? 'white' : 'var(--text-muted)',
                            fontWeight: '700', fontSize: '0.78rem', cursor: 'pointer',
                            transition: 'var(--transition)'
                          }}
                        >
                          Book / Rent Car
                        </button>
                        <button 
                          onClick={() => setDetailMode('buy')}
                          style={{
                            flex: 1, padding: '8px', border: 'none', borderRadius: '10px',
                            background: detailMode === 'buy' ? 'var(--primary)' : 'transparent',
                            color: detailMode === 'buy' ? 'white' : 'var(--text-muted)',
                            fontWeight: '700', fontSize: '0.78rem', cursor: 'pointer',
                            transition: 'var(--transition)'
                          }}
                        >
                          Buy Outright
                        </button>
                      </div>
                    )}

                    {/* Pricing configuration details in Ugandan Shillings */}
                    <div style={{
                      background: 'var(--primary-light)', padding: '16px', borderRadius: '20px',
                      border: '1px solid rgba(255, 87, 51, 0.15)',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'
                    }}>
                      <div>
                        <span style={{ fontSize: '0.68rem', color: 'var(--primary)', fontWeight: '800', textTransform: 'uppercase' }}>
                          {detailMode === 'hire' ? 'Rental Daily Rate' : 'Outright Sale Price'}
                        </span>
                        <div style={{ fontSize: '1.25rem', fontWeight: '800', color: 'white', marginTop: '2px' }}>
                          {formatUgshs(detailMode === 'hire' ? selectedCar.priceHire : selectedCar.priceSale)}
                          {detailMode === 'hire' && <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '500' }}>/day</span>}
                        </div>
                      </div>

                      {/* Quantity / Days adjustments */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#090d16', padding: '6px 12px', borderRadius: '10px', border: '1px solid rgba(255, 87, 51, 0.2)' }}>
                        <button 
                          onClick={() => {
                            if (detailMode === 'hire') {
                              setDetailDays(prev => Math.max(1, prev - 1));
                            } else {
                              setDetailQuantity(prev => Math.max(1, prev - 1));
                            }
                          }}
                          style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#cbd5e1' }}
                        >
                          <Minus size={13} />
                        </button>
                        <span style={{ fontSize: '0.8rem', fontWeight: '800', minWidth: '24px', textAlign: 'center', color: 'white' }}>
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
                          style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#cbd5e1' }}
                        >
                          <Plus size={13} />
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
                          fontSize: '0.82rem', fontWeight: '800', cursor: 'pointer',
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
                          fontSize: '0.82rem', fontWeight: '800', cursor: 'pointer',
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
                          fontSize: '0.82rem', fontWeight: '800', cursor: 'pointer',
                          color: activeDetailTab === 'policy' ? 'var(--primary)' : 'var(--text-muted)',
                          position: 'relative'
                        }}
                      >
                        <span>Showroom Terms</span>
                        {activeDetailTab === 'policy' && <div className="tab-active-indicator" />}
                      </button>
                    </div>

                    {/* Tab panels info */}
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '24px' }}>
                      {activeDetailTab === 'desc' && (
                        <p>{selectedCar.description}</p>
                      )}

                      {activeDetailTab === 'specs' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '6px' }}>
                            <span style={{ fontWeight: '600' }}>Engine Unit</span>
                            <span style={{ color: 'white' }}>{selectedCar.specs.engine}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '6px' }}>
                            <span style={{ fontWeight: '600' }}>Total Horsepower</span>
                            <span style={{ color: 'white' }}>{selectedCar.specs.horsepower}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '6px' }}>
                            <span style={{ fontWeight: '600' }}>Fuel Option</span>
                            <span style={{ color: 'white' }}>{selectedCar.specs.fuel}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '6px' }}>
                            <span style={{ fontWeight: '600' }}>Transmission Gearbox</span>
                            <span style={{ color: 'white' }}>{selectedCar.specs.transmission}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '6px' }}>
                            <span style={{ fontWeight: '600' }}>Luggage Capacity</span>
                            <span style={{ color: 'white' }}>{selectedCar.specs.luggage} bags</span>
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
                  background: 'rgba(15, 22, 38, 0.95)',
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
                      flex: 1, background: 'rgba(255, 255, 255, 0.05)', color: 'white',
                      border: '1px solid var(--border-light)', borderRadius: '14px', padding: '12px 0',
                      fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                      transition: 'var(--transition)'
                    }}
                  >
                    <ShoppingBag size={15} />
                    <span>Add to Enquiry</span>
                  </button>

                  <a 
                    href={generateSingleWhatsAppMessage(selectedCar, detailMode, detailDays, detailQuantity)}
                    target="_blank"
                    rel="noreferrer"
                    className="animate-glow-pulse"
                    style={{
                      flex: 1.2, background: 'var(--success)', color: 'white',
                      border: 'none', borderRadius: '14px', padding: '12px 0',
                      fontWeight: '800', fontSize: '0.82rem', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                      textDecoration: 'none', textAlign: 'center',
                      boxShadow: '0 4px 15px rgba(18, 161, 80, 0.3)'
                    }}
                  >
                    <MessageSquare size={15} fill="white" />
                    <span>Book on WhatsApp</span>
                  </a>
                </div>

              </div>
            )}

            {/* CHAT/SUPPORT BOTTOM DRAWER DRAWER (Phone number completely hidden in UI) */}
            {isChatOpen && (
              <>
                {/* Overlay backdrop */}
                <div className="modal-overlay" onClick={() => setIsChatOpen(false)} />
                
                {/* Drawer Panel */}
                <div className="chat-drawer animate-drawer-up">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                    <div>
                      <h4 style={{ fontSize: '1rem', fontWeight: '800', color: 'white' }}>KieZcars Support Center</h4>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Kampala Showroom Representatives • Active 24/7</span>
                    </div>
                    <button 
                      onClick={() => setIsChatOpen(false)}
                      style={{
                        background: 'rgba(255,255,255,0.05)', 
                        border: 'none', 
                        borderRadius: '50%', 
                        width: '28px', 
                        height: '28px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#94a3b8',
                        cursor: 'pointer'
                      }}
                    >
                      <X size={16} />
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <a 
                      href="https://wa.me/256702370441"
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        display: 'flex', alignItems: 'center', gap: '14px',
                        padding: '14px', borderRadius: '16px', background: 'rgba(18, 161, 80, 0.08)',
                        textDecoration: 'none', color: 'white', fontSize: '0.85rem',
                        border: '1px solid rgba(18, 161, 80, 0.25)', 
                        transition: 'var(--transition)'
                      }}
                    >
                      <div style={{ color: 'var(--success)', background: 'rgba(18, 161, 80, 0.15)', padding: '10px', borderRadius: '12px' }}>
                        <MessageSquare size={20} fill="var(--success)" />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '800' }}>WhatsApp Chat Support</div>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Tap to instantly message representatives</span>
                      </div>
                    </a>

                    <a 
                      href="tel:+256702370441"
                      style={{
                        display: 'flex', alignItems: 'center', gap: '14px',
                        padding: '14px', borderRadius: '16px', background: 'rgba(255, 87, 51, 0.08)',
                        textDecoration: 'none', color: 'white', fontSize: '0.85rem',
                        border: '1px solid rgba(255, 87, 51, 0.25)', 
                        transition: 'var(--transition)'
                      }}
                    >
                      <div style={{ color: 'var(--primary)', background: 'rgba(255, 87, 51, 0.15)', padding: '10px', borderRadius: '12px' }}>
                        <Phone size={20} fill="var(--primary)" />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '800' }}>Direct Call Hotline</div>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Call standard rates via local telecom carrier</span>
                      </div>
                    </a>
                  </div>

                  <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '16px', lineHeight: '1.4' }}>
                    Our sales agents are standby to assist you with vehicle hire verification, wedding convoy planning, airport drops, and import specifications.
                  </p>
                </div>
              </>
            )}

          </div>
        </div>
      </div>
    </>
  );
}
