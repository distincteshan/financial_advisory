import React, { useEffect, useRef } from 'react';

let tvScriptLoadingPromise;

const PriceChart = ({ symbol, theme = 'dark' }) => {
  const onLoadScriptRef = useRef();
  const containerRef = useRef();

  useEffect(() => {
    onLoadScriptRef.current = createWidget;

    if (!tvScriptLoadingPromise) {
      tvScriptLoadingPromise = new Promise((resolve) => {
        const script = document.createElement('script');
        script.id = 'tradingview-widget-loading-script';
        script.src = 'https://s3.tradingview.com/tv.js';
        script.type = 'text/javascript';
        script.onload = resolve;
        document.head.appendChild(script);
      });
    }

    tvScriptLoadingPromise.then(() => onLoadScriptRef.current && onLoadScriptRef.current());

    return () => {
      onLoadScriptRef.current = null;
      if (containerRef.current && containerRef.current._tv) {
        containerRef.current._tv.remove();
        containerRef.current._tv = null;
      }
    };
  }, [symbol]);

  const createWidget = () => {
    if (document.getElementById('tradingview-widget') && 'TradingView' in window) {
      let symbolToUse = symbol;
      
      // Map our symbols to TradingView symbols
      if (symbol === 'Bitcoin') symbolToUse = 'BTCINR';
      else if (symbol === 'Ethereum') symbolToUse = 'ETHINR';
      else if (symbol === 'Solana') symbolToUse = 'SOLINR';
      else if (symbol === 'Gold') symbolToUse = 'GOLD';
      else if (symbol.includes('Flexi Cap')) return; // Skip for mutual funds
      else symbolToUse = symbol + '.NS'; // For stocks

      const exchange = symbolToUse.endsWith('.NS') ? 'NSE' : 'BINANCE';
      
      if (containerRef.current._tv) {
        containerRef.current._tv.remove();
        containerRef.current._tv = null;
      }

      containerRef.current._tv = new window.TradingView.widget({
        container: document.getElementById('tradingview-widget'),
        width: '100%',
        height: 500,
        symbol: `${exchange}:${symbolToUse}`,
        interval: 'D',
        timezone: 'Asia/Kolkata',
        theme: theme,
        style: '1',
        locale: 'in',
        toolbar_bg: theme === 'dark' ? '#1A1A1A' : '#f1f3f6',
        enable_publishing: false,
        allow_symbol_change: false,
        save_image: false,
        studies: ['RSI@tv-basicstudies'],
        show_popup_button: false,
        popup_width: '1000',
        popup_height: '650',
        hide_side_toolbar: false,
        details: true,
        hotlist: true,
        calendar: true,
        studies_overrides: {},
        overrides: {
          "mainSeriesProperties.showCountdown": true,
          "paneProperties.background": theme === 'dark' ? "#1A1A1A" : "#ffffff",
          "paneProperties.vertGridProperties.color": theme === 'dark' ? "#363c4e" : "#f0f3fa",
          "paneProperties.horzGridProperties.color": theme === 'dark' ? "#363c4e" : "#f0f3fa",
          "symbolWatermarkProperties.transparency": 90,
          "scalesProperties.textColor": theme === 'dark' ? "#AAA" : "#000",
        }
      });
    }
  };

  return (
    <div className="tradingview-chart-container">
      <div
        id="tradingview-widget"
        ref={containerRef}
        style={{ height: '500px', width: '100%' }}
      />
    </div>
  );
};

export default PriceChart; 