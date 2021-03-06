import '@webcomponents/shadycss/entrypoints/apply-shim';

import { PolymerElement } from '@polymer/polymer/polymer-element';
import { html } from '@polymer/polymer/lib/utils/html-tag';

import { HEADER_TEMPLATE } from './cosmoz-omnitable-templatize-mixin';
import { repeaterMixin } from './cosmoz-omnitable-repeater-mixin';

/**
 * @polymer
 * @customElement
 * @appliesMixin repeaterMixin
 */
class OmnitableHeaderRow extends repeaterMixin(PolymerElement) {
	static get template() {
		return html`
		<style>
			:host {
				@apply --layout-horizontal;
				@apply --layout-end;
			}

			:host > ::slotted(*) {
				@apply --layout-flex;
				padding: 0 3px;
				white-space: nowrap;
				text-overflow: ellipsis;
			}
			:host > ::slotted([hidden]),
			:host [hidden] {
				display: none !important;
			}
		</style>
		<slot name="header-cell"></slot>
`;
	}

	static get is() {
		return 'cosmoz-omnitable-header-row';
	}

	get _elementType() {
		return 'div';
	}

	get _slotName() {
		return 'header-cell';
	}

	constructor() {
		super();
		this.trackColumns();
	}

	/**
	 * @inheritdoc
	 */
	_getTemplateInstance(column) {
		return column.getTemplateInstance(HEADER_TEMPLATE);
	}

	/**
	 * @inheritdoc
	 */
	_configureElement(element, column, instance) {
		super._configureElement(element, column, instance);
		element.classList.toggle(column.headerCellClass, true);
		element.classList.toggle('header-cell', true);
		element.setAttribute('title', column.title);
	}
}
customElements.define(OmnitableHeaderRow.is, OmnitableHeaderRow);
