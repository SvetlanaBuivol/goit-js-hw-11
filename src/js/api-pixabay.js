const axios = require('axios').default;

export default class ImagesApiService {
  constructor() {
      this.searchQuery = '';
      this.page = 1;
  }

  getImages() {
    const API_KEY = '36867238-d18d023007d9afe06dc91b3fb';
    const BASE_URL = 'https://pixabay.com/api/';

    axios
      .get(
        `${BASE_URL}?key=${API_KEY}&q=${this.searchQuery}&image_type=photo&page=${this.page}&per_page=40`
      )
        .then(response => {
            this.page += 1;
        console.log(this);
      });
    }
    
    get query() {
        return this.searchQuery;
    }

    set query(newQuery) {
        this.searchQuery = newQuery;
    }

    resetPage() {
        this.page = 1;
    }
}
