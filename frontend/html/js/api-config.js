// API base URL selection for local and production
(function () {
    const DEFAULT_LOCAL = 'http://localhost:5000';
    const DEFAULT_REMOTE = 'https://shantisongho-web-d8hzbchtdweadvb3.southeastasia-01.azurewebsites.net';

    const host = window.location.hostname;
    const isLocal = host === 'localhost' || host === '127.0.0.1';

    const params = new URLSearchParams(window.location.search);
    const urlOverride = params.get('api');
    const stored = localStorage.getItem('apiBaseUrl');

    const baseUrl = urlOverride || stored || (isLocal ? DEFAULT_LOCAL : DEFAULT_REMOTE);
    if (urlOverride) {
        localStorage.setItem('apiBaseUrl', urlOverride);
    }

    window.API_BASE_URL = baseUrl;
})();
