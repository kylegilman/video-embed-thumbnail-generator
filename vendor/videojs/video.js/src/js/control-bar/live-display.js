/**
 * @file live-display.js
 */
import Component from '../component';
import * as Dom from '../utils/dom.js';
import document from 'global/document';

// TODO - Future make it click to snap to live

/**
 * Displays the live indicator when duration is Infinity.
 *
 * @extends Component
 */
class LiveDisplay extends Component {

  /**
   * Creates an instance of this class.
   *
   * @param {Player} player
   *        The `Player` that this class should be attached to.
   *
   * @param {Object} [options]
   *        The key/value store of player options.
   */
  constructor(player, options) {
    super(player, options);

    this.updateShowing();
    this.on(this.player(), 'durationchange', (e) => this.updateShowing(e));
  }

  /**
   * Create the `Component`'s DOM element
   *
   * @return {Element}
   *         The element that was created.
   */
  createEl() {
    const el = super.createEl('div', {
      className: 'vjs-live-control vjs-control'
    });

    this.contentEl_ = Dom.createEl('div', {
      className: 'vjs-live-display'
    }, {
      'aria-live': 'off'
    });

    this.contentEl_.appendChild(Dom.createEl('span', {
      className: 'vjs-control-text',
      textContent: `${this.localize('Stream Type')}\u00a0`
    }));
    this.contentEl_.appendChild(document.createTextNode(this.localize('LIVE')));

    el.appendChild(this.contentEl_);
    return el;
  }

  dispose() {
    this.contentEl_ = null;

    super.dispose();
  }

  /**
   * Check the duration to see if the LiveDisplay should be showing or not. Then show/hide
   * it accordingly
   *
   * @param {EventTarget~Event} [event]
   *        The {@link Player#durationchange} event that caused this function to run.
   *
   * @listens Player#durationchange
   */
  updateShowing(event) {
    if (this.player().duration() === Infinity) {
      this.show();
    } else {
      this.hide();
    }
  }

}

Component.registerComponent('LiveDisplay', LiveDisplay);
export default LiveDisplay;
