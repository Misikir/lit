/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
import {
  css,
  ReactiveElement,
  unsafeCSS,
  CSSResultArray,
} from '../reactive-element.js';

import {
  canTestReactiveElement,
  generateElementName,
  getComputedStyleValue,
  RenderingElement,
  html,
} from './test-helpers.js';
import {assert} from '@esm-bundle/chai';

const extraGlobals = window as LitExtraGlobals;

(canTestReactiveElement ? suite : suite.skip)('Styling', () => {
  suite('Static get styles', () => {
    let container: HTMLElement;

    setup(() => {
      container = document.createElement('div');
      document.body.appendChild(container);
    });

    teardown(() => {
      if (container && container.parentNode) {
        container.parentNode.removeChild(container);
      }
    });

    test('content shadowRoot is styled via static get styles in multiple instances', async () => {
      const name = generateElementName();
      customElements.define(
        name,
        class extends RenderingElement {
          static get styles() {
            return [
              css`
                div {
                  border: 2px solid blue;
                }
              `,
              css`
                span {
                  display: block;
                  border: 3px solid blue;
                }
              `,
            ];
          }

          render() {
            return html` <div>Testing1</div>
              <span>Testing2</span>`;
          }
        }
      );
      const testInstance = async () => {
        const el = document.createElement(name);
        container.appendChild(el);
        await (el as ReactiveElement).updateComplete;
        const div = el.shadowRoot!.querySelector('div');
        assert.equal(
          getComputedStyleValue(div!, 'border-top-width').trim(),
          '2px'
        );
        const span = el.shadowRoot!.querySelector('span');
        assert.equal(
          getComputedStyleValue(span!, 'border-top-width').trim(),
          '3px'
        );
      };
      // test multiple instances
      await testInstance();
      await testInstance();
      await testInstance();
    });

    // Test this in Shadow DOM without `adoptedStyleSheets` only since it's easily
    // detectable in that case.
    const testShadowDOMStyleCount =
      (!extraGlobals.ShadyDOM || !extraGlobals.ShadyDOM.inUse) &&
      !('adoptedStyleSheets' in Document.prototype);
    (testShadowDOMStyleCount ? test : test.skip)(
      'when an array is returned from `static get styles`, one style is generated per array item',
      async () => {
        const name = generateElementName();
        customElements.define(
          name,
          class extends RenderingElement {
            static get styles() {
              return [
                css`
                  div {
                    border: 2px solid blue;
                  }
                `,
                css`
                  span {
                    display: block;
                    border: 3px solid blue;
                  }
                `,
              ];
            }

            render() {
              return html` <div>Testing1</div>
                <span>Testing2</span>`;
            }
          }
        );
        const el = document.createElement(name);
        container.appendChild(el);
        await (el as ReactiveElement).updateComplete;
        assert.equal(el.shadowRoot!.querySelectorAll('style').length, 2);
      }
    );

    test('static get styles can be a single CSSResult', async () => {
      const name = generateElementName();
      customElements.define(
        name,
        class extends RenderingElement {
          static get styles() {
            return css`
              div {
                border: 2px solid blue;
              }
            `;
          }

          render() {
            return html` <div>Testing</div>`;
          }
        }
      );
      const el = document.createElement(name);
      container.appendChild(el);
      await (el as ReactiveElement).updateComplete;
      const div = el.shadowRoot!.querySelector('div');
      assert.equal(
        getComputedStyleValue(div!, 'border-top-width').trim(),
        '2px'
      );
    });

    test('static get styles allows composition via `css` values', async () => {
      const name = generateElementName();
      customElements.define(
        name,
        class extends RenderingElement {
          static get styles() {
            // Alias avoids syntax highlighting issues in editors
            const cssValue = css;
            return [
              css`
                div {
                  border: ${cssValue`2px solid blue`};
                }
              `,
              css`
                span {
                  display: block;
                  border: ${cssValue`3px solid blue`};
                }
              `,
            ];
          }

          render() {
            return html` <div>Testing1</div>
              <span>Testing2</span>`;
          }
        }
      );
      const el = document.createElement(name);
      container.appendChild(el);
      await (el as ReactiveElement).updateComplete;
      const div = el.shadowRoot!.querySelector('div');
      assert.equal(
        getComputedStyleValue(div!, 'border-top-width').trim(),
        '2px'
      );
      const span = el.shadowRoot!.querySelector('span');
      assert.equal(
        getComputedStyleValue(span!, 'border-top-width').trim(),
        '3px'
      );
    });

    test('Any value can be used in `css` when included with `unsafeCSS`', async () => {
      const name = generateElementName();
      const someVar = `2px solid blue`;
      customElements.define(
        name,
        class extends RenderingElement {
          static get styles() {
            return css`
              div {
                border: ${unsafeCSS(someVar)};
              }
            `;
          }

          render() {
            return html` <div>Testing</div>`;
          }
        }
      );
      const el = document.createElement(name);
      container.appendChild(el);
      await (el as ReactiveElement).updateComplete;
      const div = el.shadowRoot!.querySelector('div');
      assert.equal(
        getComputedStyleValue(div!, 'border-top-width').trim(),
        '2px'
      );
    });

    test('unsafeCSS can be used standalone', async () => {
      const name = generateElementName();
      customElements.define(
        name,
        class extends RenderingElement {
          static get styles() {
            return unsafeCSS('div {border: 2px solid blue}');
          }

          render() {
            return html` <div>Testing</div>`;
          }
        }
      );
      const el = document.createElement(name);
      container.appendChild(el);
      await (el as ReactiveElement).updateComplete;
      const div = el.shadowRoot!.querySelector('div');
      assert.equal(
        getComputedStyleValue(div!, 'border-top-width').trim(),
        '2px'
      );
    });

    test('`static get styles` applies last instance of style', async () => {
      const name = generateElementName();
      const s1 = css`
        div {
          border: 2px solid blue;
        }
      `;
      const s2 = css`
        div {
          border: 3px solid blue;
        }
      `;
      customElements.define(
        name,
        class extends RenderingElement {
          static get styles() {
            return [s1, s2, s1];
          }

          render() {
            return html` <div>Testing1</div>`;
          }
        }
      );
      const el = document.createElement(name);
      container.appendChild(el);
      await (el as ReactiveElement).updateComplete;
      const div = el.shadowRoot!.querySelector('div');
      assert.equal(
        getComputedStyleValue(div!, 'border-top-width').trim(),
        '2px'
      );
    });

    test('`static get styles` array is flattened', async () => {
      const name = generateElementName();
      const styles = [
        css`
          .level1 {
            border: 1px solid blue;
          }
        `,
        [
          css`
            .level2 {
              border: 2px solid blue;
            }
          `,
          [
            css`
              .level3 {
                border: 3px solid blue;
              }
            `,
            [
              css`
                .level4 {
                  border: 4px solid blue;
                }
              `,
            ],
          ],
        ],
      ];
      customElements.define(
        name,
        class extends RenderingElement {
          static get styles() {
            return [styles];
          }

          render() {
            return html` <div class="level1">Testing1</div>
              <div class="level2">Testing2</div>
              <div class="level3">Testing3</div>
              <div class="level4">Testing4</div>`;
          }
        }
      );
      const el = document.createElement(name);
      container.appendChild(el);
      await (el as ReactiveElement).updateComplete;
      const level1 = el.shadowRoot!.querySelector('.level1');
      const level2 = el.shadowRoot!.querySelector('.level2');
      const level3 = el.shadowRoot!.querySelector('.level3');
      const level4 = el.shadowRoot!.querySelector('.level4');
      assert.equal(
        getComputedStyleValue(level1!, 'border-top-width').trim(),
        '1px'
      );
      assert.equal(
        getComputedStyleValue(level2!, 'border-top-width').trim(),
        '2px'
      );
      assert.equal(
        getComputedStyleValue(level3!, 'border-top-width').trim(),
        '3px'
      );
      assert.equal(
        getComputedStyleValue(level4!, 'border-top-width').trim(),
        '4px'
      );
    });

    test('`styles` can be a static field', async () => {
      const name = generateElementName();
      customElements.define(
        name,
        class extends RenderingElement {
          static styles = [
            css`
              div {
                border: 2px solid blue;
              }
            `,
            css`
              span {
                display: block;
                border: 3px solid blue;
              }
            `,
          ];

          render() {
            return html` <div>Testing1</div>
              <span>Testing2</span>`;
          }
        }
      );
      const el = document.createElement(name);
      container.appendChild(el);
      await (el as ReactiveElement).updateComplete;
      const div = el.shadowRoot!.querySelector('div');
      assert.equal(
        getComputedStyleValue(div!, 'border-top-width').trim(),
        '2px'
      );
      const span = el.shadowRoot!.querySelector('span');
      assert.equal(
        getComputedStyleValue(span!, 'border-top-width').trim(),
        '3px'
      );
    });

    test('can extend and augment `styles`', async () => {
      const base = generateElementName();
      class BaseClass extends RenderingElement {
        static get styles() {
          return css`
            div {
              border: 2px solid blue;
            }
          `;
        }

        render() {
          return html` <div>Testing1</div>`;
        }
      }
      customElements.define(base, BaseClass);
      const sub = generateElementName();
      customElements.define(
        sub,
        class extends BaseClass {
          static get styles() {
            return [
              super.styles,
              css`
                span {
                  display: block;
                  border: 3px solid blue;
                }
              `,
            ];
          }

          render() {
            return html` ${super.render()}
              <span>Testing2</span>`;
          }
        }
      );

      const subsub = generateElementName();
      customElements.define(
        subsub,
        class extends BaseClass {
          static get styles() {
            return [
              super.styles,
              css`
                p {
                  display: block;
                  border: 4px solid blue;
                }
              `,
            ];
          }

          render() {
            return html` ${super.render()}
              <p>Testing3</p>`;
          }
        }
      );
      let el = document.createElement(base);
      container.appendChild(el);
      await (el as ReactiveElement).updateComplete;
      const div = el.shadowRoot!.querySelector('div');
      assert.equal(
        getComputedStyleValue(div!, 'border-top-width').trim(),
        '2px'
      );
      el = document.createElement(sub);
      container.appendChild(el);
      await (el as ReactiveElement).updateComplete;
      const span = el.shadowRoot!.querySelector('span');
      assert.equal(
        getComputedStyleValue(span!, 'border-top-width').trim(),
        '3px'
      );
      el = document.createElement(subsub);
      container.appendChild(el);
      await (el as ReactiveElement).updateComplete;
      const p = el.shadowRoot!.querySelector('p');
      assert.equal(getComputedStyleValue(p!, 'border-top-width').trim(), '4px');
    });

    test('can extend and override `styles`', async () => {
      const base = generateElementName();
      class BaseClass extends RenderingElement {
        static get styles() {
          return css`
            div {
              border: 2px solid blue;
            }
          `;
        }

        render() {
          return html` <div>Testing1</div>`;
        }
      }
      customElements.define(base, BaseClass);

      const sub = generateElementName();
      customElements.define(
        sub,
        class extends BaseClass {
          static get styles() {
            return css`
              div {
                border: 3px solid blue;
              }
            `;
          }
        }
      );

      const subsub = generateElementName();
      customElements.define(
        subsub,
        class extends BaseClass {
          static get styles() {
            return css`
              div {
                border: 4px solid blue;
              }
            `;
          }
        }
      );
      let el = document.createElement(base);
      container.appendChild(el);
      await (el as ReactiveElement).updateComplete;
      let div = el.shadowRoot!.querySelector('div');
      assert.equal(
        getComputedStyleValue(div!, 'border-top-width').trim(),
        '2px'
      );
      el = document.createElement(sub);
      container.appendChild(el);
      await (el as ReactiveElement).updateComplete;
      div = el.shadowRoot!.querySelector('div');
      assert.equal(
        getComputedStyleValue(div!, 'border-top-width').trim(),
        '3px'
      );
      el = document.createElement(subsub);
      container.appendChild(el);
      await (el as ReactiveElement).updateComplete;
      div = el.shadowRoot!.querySelector('div');
      assert.equal(
        getComputedStyleValue(div!, 'border-top-width').trim(),
        '4px'
      );
    });

    test('elements should inherit `styles` by default', async () => {
      const base = generateElementName();
      class BaseClass extends RenderingElement {
        static styles = css`
          div {
            border: 4px solid black;
          }
        `;
      }
      customElements.define(base, BaseClass);

      const sub = generateElementName();
      customElements.define(
        sub,
        class extends BaseClass {
          render() {
            return html`<div></div>`;
          }
        }
      );

      const el = document.createElement(sub);
      container.appendChild(el);
      await (el as ReactiveElement).updateComplete;
      const div = el.shadowRoot!.querySelector('div');
      assert.equal(
        getComputedStyle(div!).getPropertyValue('border-top-width').trim(),
        '4px'
      );
    });

    test('element class only gathers styles once', async () => {
      const base = generateElementName();
      let getStylesCounter = 0;
      let stylesCounter = 0;
      customElements.define(
        base,
        class extends RenderingElement {
          static finalizeStyles(styles: CSSResultArray) {
            getStylesCounter++;
            return super.finalizeStyles(styles);
          }

          static get styles() {
            stylesCounter++;
            return css`
              :host {
                border: 10px solid black;
              }
            `;
          }
          render() {
            return html`<div>styled</div>`;
          }
        }
      );
      const el1 = document.createElement(base);
      const el2 = document.createElement(base);
      container.appendChild(el1);
      container.appendChild(el2);
      await Promise.all([
        (el1 as ReactiveElement).updateComplete,
        (el2 as ReactiveElement).updateComplete,
      ]);
      assert.equal(
        getComputedStyle(el1).getPropertyValue('border-top-width').trim(),
        '10px',
        'el1 styled correctly'
      );
      assert.equal(
        getComputedStyle(el2).getPropertyValue('border-top-width').trim(),
        '10px',
        'el2 styled correctly'
      );
      assert.equal(
        stylesCounter,
        1,
        'styles property should only be accessed once'
      );
      assert.equal(getStylesCounter, 1, 'getStyles() should be called once');
    });

    test('Styles are not removed if the first rendered value is undefined.', async () => {
      const localName = generateElementName();

      class SomeCustomElement extends RenderingElement {
        static styles = css`
          :host {
            border: 4px solid black;
          }
        `;

        renderUndefined: boolean;

        constructor() {
          super();
          this.renderUndefined = true;
        }

        static get properties() {
          return {
            renderUndefined: {
              type: Boolean,
              value: true,
            },
          };
        }

        render() {
          if (this.renderUndefined) {
            return undefined;
          }

          return html`Some text.`;
        }
      }
      customElements.define(localName, SomeCustomElement);

      const element = document.createElement(localName) as SomeCustomElement;
      document.body.appendChild(element);

      await (element as ReactiveElement).updateComplete;
      assert.equal(
        getComputedStyle(element).getPropertyValue('border-top-width').trim(),
        '4px'
      );

      element.renderUndefined = false;

      await (element as ReactiveElement).updateComplete;
      assert.equal(
        getComputedStyle(element).getPropertyValue('border-top-width').trim(),
        '4px'
      );

      document.body.removeChild(element);
    });

    const testAdoptedStyleSheets =
      window.ShadowRoot && 'replace' in CSSStyleSheet.prototype;
    (testAdoptedStyleSheets ? test : test.skip)(
      'Can return CSSStyleSheet where adoptedStyleSheets are natively supported',
      async () => {
        const sheet = new CSSStyleSheet();
        sheet.replaceSync('div { border: 4px solid red; }');
        const normal = css`
          span {
            border: 4px solid blue;
          }
        `;

        const base = generateElementName();
        customElements.define(
          base,
          class extends RenderingElement {
            static styles = [sheet, normal];

            render() {
              return html`<div></div>
                <span></span>`;
            }
          }
        );

        const el = document.createElement(base);
        container.appendChild(el);
        await (el as ReactiveElement).updateComplete;
        const div = el.shadowRoot!.querySelector('div')!;
        assert.equal(
          getComputedStyle(div).getPropertyValue('border-top-width').trim(),
          '4px'
        );

        const span = el.shadowRoot!.querySelector('span')!;
        assert.equal(
          getComputedStyle(span).getPropertyValue('border-top-width').trim(),
          '4px'
        );

        // When the WC polyfills are included, calling .replaceSync is a noop to
        // our styles as they're already flattened (so expect 4px). Otherwise,
        // look for the updated value.
        const usesAdoptedStyleSheet =
          extraGlobals.ShadyCSS === undefined ||
          extraGlobals.ShadyCSS.nativeShadow;
        const expectedValue = usesAdoptedStyleSheet ? '2px' : '4px';
        sheet.replaceSync('div { border: 2px solid red; }');

        assert.equal(
          getComputedStyle(div).getPropertyValue('border-top-width').trim(),
          expectedValue
        );
      }
    );

    // Test that when ShadyCSS is enabled (while still having native support for
    // adoptedStyleSheets), we can return a CSSStyleSheet that will be flattened
    // and play nice with others.
    const testShadyCSSWithAdoptedStyleSheetSupport =
      window.ShadowRoot &&
      'replace' in CSSStyleSheet.prototype &&
      extraGlobals.ShadyCSS !== undefined &&
      !extraGlobals.ShadyCSS.nativeShadow;
    (testShadyCSSWithAdoptedStyleSheetSupport ? test : test.skip)(
      'CSSStyleSheet is flattened where ShadyCSS is enabled yet adoptedStyleSheets are supported',
      async () => {
        const sheet = new CSSStyleSheet();
        sheet.replaceSync('div { border: 4px solid red; }');

        const base = generateElementName();
        customElements.define(
          base,
          class extends RenderingElement {
            static styles = sheet;

            render() {
              return html`<div></div>`;
            }
          }
        );

        const el = document.createElement(base);
        container.appendChild(el);
        await (el as ReactiveElement).updateComplete;

        const div = el.shadowRoot!.querySelector('div')!;
        assert.equal(
          getComputedStyle(div).getPropertyValue('border-top-width').trim(),
          '4px'
        );

        // CSSStyleSheet update should fail, as the styles will be flattened.
        sheet.replaceSync('div { border: 2px solid red; }');
        assert.equal(
          getComputedStyle(div).getPropertyValue('border-top-width').trim(),
          '4px',
          'CSS should not reflect CSSStyleSheet as it was flattened'
        );
      }
    );
  });
});
