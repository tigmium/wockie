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
    ]);
    assert.deepEqual(tree, {
      documentation: {
        customization: {},
        'constructor-options': {}
      }
    });
  })
})