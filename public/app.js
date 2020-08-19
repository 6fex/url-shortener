const app = new Vue ({
    el: '#app',
    data: {
        original_url: '',
        created: null,
        error: '',
    },
    methods: {
        async createUrl() {
            const response = await fetch('/api/shorturl/new', {
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                },
                body: JSON.stringify({
                    original_url: this.original_url,
                }),
            });
            if(response.ok) {
                const result = await response.json();
                this.created = `http://localhost:9999/api/shorturl/${result.short_url}`;
            } else if(response.status === 429) {
                this.error = 'You are sending too many requests. Try again in 20 seconds.'
            } else {
                const result = await response.json();
                this.error = result.message;
            }
        }
    }
});
