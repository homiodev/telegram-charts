document.addEventListener('DOMContentLoaded', function () {
    const tg = window.Telegram.WebApp;
    tg.expand(); // Расширяем Web App на весь экран

    const chartContainer = document.getElementById('chart-container');
    const loadingDiv = document.getElementById('loading');
    
    // Получаем тикер из URL (например, ...?ticker=AAPL)
    const urlParams = new URLSearchParams(window.location.search);
    const ticker = urlParams.get('ticker') || 'AAPL'; // По умолчанию AAPL, если тикер не передан

    // --- ВАШ API КЛЮЧ ---
    const apiKey = 'T8XRRD15SJUJ2QZM'; 
    // ВАЖНО: Хранить ключ в публичном JS - не безопасно для коммерческих проектов.
    // Для личного бота это приемлемый риск.

    // Настраиваем цвета графика в зависимости от темы Telegram
    const chartProperties = {
        layout: {
            background: { color: tg.themeParams.bg_color || '#ffffff' },
            textColor: tg.themeParams.text_color || '#182233',
        },
        grid: {
            vertLines: { color: tg.themeParams.secondary_bg_color || '#e1ecf7' },
            horzLines: { color: tg.themeParams.secondary_bg_color || '#e1ecf7' },
        },
        timeScale: {
            timeVisible: true,
            secondsVisible: false,
        }
    };

    const chart = createChart(chartContainer, chartProperties);
    const candlestickSeries = chart.addCandlestickSeries({
        upColor: '#00b760',
        downColor: '#ff4949',
        borderDownColor: '#ff4949',
        borderUpColor: '#00b760',
        wickDownColor: '#ff4949',
        wickUpColor: '#00b760',
    });

    // Функция для загрузки и отображения данных
    async function loadChartData() {
        try {
            // Запрашиваем внутридневные данные за последние дни
            const response = await fetch(`https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${ticker}&interval=5min&outputsize=full&apikey=${apiKey}`);
            const data = await response.json();

            // Alpha Vantage возвращает данные в немного странном формате, преобразуем их
            const timeSeries = data['Time Series (5min)'];
            const chartData = Object.keys(timeSeries).map(timestamp => {
                const candle = timeSeries[timestamp];
                return {
                    time: new Date(timestamp).getTime() / 1000, // Конвертируем в UNIX timestamp
                    open: parseFloat(candle['1. open']),
                    high: parseFloat(candle['2. high']),
                    low: parseFloat(candle['3. low']),
                    close: parseFloat(candle['4. close']),
                };
            }).reverse(); // Данные приходят в обратном порядке, переворачиваем их

            candlestickSeries.setData(chartData);
            chart.timeScale().fitContent(); // Масштабируем график по данным
            
            loadingDiv.style.display = 'none'; // Прячем сообщение "Loading"
        } catch (error) {
            console.error('Error fetching chart data:', error);
            loadingDiv.textContent = `Failed to load data for ${ticker}`;
        }
    }

    loadChartData();
});
