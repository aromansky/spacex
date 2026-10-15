class SpaceX {

    constructor(baseUrl = "https://ll.thespacedevs.com/2.3.0/") {
        this.baseUrl = baseUrl;
    }

    _get(url) {
        return fetch(url).then(response => {
            if (!response.ok) {
                throw new Error(`HTTP ${response.status} при запросе ${url}`);
            }
            return response.json();
        });
    }

    launches(limit = 30, providerId = null) {
        let url = `${this.baseUrl}launches/previous/?limit=${limit}`;
        if (providerId !== null) {
            url += `&lsp__id=${providerId}`;
        }
        return this._get(url).then(data => data.results);
    }

    async launchpads(limit = 100) {
        let url = `${this.baseUrl}pads/?limit=${limit}`;
        const all = [];
        while (url) {
            const data = await this._get(url);
            all.push(...data.results);
            url = data.next;
        }
        return all;
    }

    launchpad(id) {
        return this._get(`${this.baseUrl}pads/${id}/`);
    }
}

export {SpaceX}