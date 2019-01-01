import service from '../../../src/renderer/services/CreateDocTreeService'

const assert = require('assert');

describe('CreateDocTreeService.js', () => {
  // it('should render correct contents', () => {
  //   const vm = new Vue({
  //     el: document.createElement('div'),
  //     render: h => h(LandingPage)
  //   }).$mount()
  //
  //   expect(vm.$el.querySelector('.title').textContent).to.contain('Welcome to your new project!')
  // })

  it('aaa', () => {
    const tree = service.createDocTree([
      {
        url: 'https://buefy.github.io/documentation/',
      },
      {
        url: 'https://buefy.github.io/documentation/customization',
      },
      {
        url: 'https://buefy.github.io/documentation/constructor-options',
      },
      {
        url: 'https://jp.vuejs.org/v2/guide/',
      },
      {
        url: 'https://jp.vuejs.org/v2/guide/computed.html',
      },
      {
        url: 'https://jp.vuejs.org/v2/guide/migration-vue-router.html',
      },
      {
        url: 'https://laravel.com/docs/5.7',
      },
      {
        url: 'https://laravel.com/docs/5.7/contributions',
      },
    ]);
    assert.deepEqual(tree, [
      {
        'domain': 'buefy.github.io',
        documents: [
          {
            url: 'https://buefy.github.io/documentation/',
          },
          {
            url: 'https://buefy.github.io/documentation/customization',
          },
          {
            url: 'https://buefy.github.io/documentation/constructor-options',
          },
        ]
      },
      {
        'domain': 'jp.vuejs.org',
        documents: [
          {
            url: 'https://jp.vuejs.org/v2/guide/',
          },
          {
            url: 'https://jp.vuejs.org/v2/guide/computed.html',
          },
          {
            url: 'https://jp.vuejs.org/v2/guide/migration-vue-router.html',
          },
        ]
      },
      {
        'domain': 'laravel.com',
        documents: [
          {
            url: 'https://laravel.com/docs/5.7',
          },
          {
            url: 'https://laravel.com/docs/5.7/contributions',
          },
        ]
      },
    ]);
  })
})