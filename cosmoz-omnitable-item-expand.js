import '@webcomponents/shadycss/entrypoints/apply-shim';

import './cosmoz-omnitable-item-expand-line';

import { PolymerElement } from '@polymer/polymer/polymer-element';
import { html } from '@polymer/polymer/lib/utils/html-tag';

import { repeaterMixin } from './cosmoz-omnitable-repeater-mixin';
import { CELL_TEMPLATE } from './cosmoz-omnitable-templatize-mixin';

/**
 * @polymer
 * @customElement
 * @appliesMixin repeaterMixin
 */
class OmnitableItemExpand extends repeaterMixin(PolymerElement) {
	static get template() {
		return html`
		<style>
			:host([expanded]) {
				@apply --layout-vertical;
				padding: 5px 4%;
				line-height: 1.3em;
				border-bottom: solid 1px #e2e2e2;
				background-color: #fafafa;
				@apply --cosmoz-omnitable-item-expand;
			}

			:host(:not([expanded])) {
				display: none !important;
			}

			:host([hidden]),
			:host > ::slotted([hidden]),
			:host [hidden] {
				display: none !important;
			}
		</style>
		<slot name="item-expand-line"></slot>
`;
	}

	static get is() {
		return 'cosmoz-omnitable-item-expand';
	}

	static get properties() {
		return {
			item: {
				type: Object
			},

			selected: {
				type: Boolean,
				observer: '_selectedChanged'
			},

			expanded: {
				type: Boolean,
				value: false,
				reflectToAttribute: true,
				observer: '_expandedChanged'
			},

			hidden: {
				type: Boolean,
				reflectToAttribute: true
			}
		};
	}

	static get observers() {
		return [
			'_updateSize(columns.length)',
			'_itemUpdated(item.*)'
		];
	}

	get _elementType() {
		return 'cosmoz-omnitable-item-expand-line';
	}

	get _slotName() {
		return 'item-expand-line';
	}

	/**
	 * @inheritdoc
	 */
	_getTemplateInstance(column) {
		return column.getTemplateInstance(
			CELL_TEMPLATE,
			{item: this.item, selected: this.selected, expanded: this.expanded}
		);
	}

	/**
	 * @inheritdoc
	 */
	_configureElement(element, column, instance) {
		super._configureElement(element, column, instance);
		element.column = column;
	}

	_updateSize(columnsCount) {
		this.hidden = columnsCount === 0;
		if (this.expanded) {
			// Notify omnitable that this item is expanded and my need individual resize
			this.dispatchEvent(new CustomEvent('update-item-size', {
				bubbles: true,
				detail: { item: this.item }
			}));
		}
	}

	_itemUpdated(changeRecord) {
		this.forwardPathChange(changeRecord);
	}

	_selectedChanged(selected) {
		this.forwardChange('selected', selected);
	}

	_expandedChanged(expanded, prevValue) {
		this.forwardChange('expanded', expanded);

		if (expanded) {
			this.trackColumns();
			this.renderCells();
		} else if (prevValue === true) {
			this.stopTrackingColumns();
			this.destroyCells();
		}
	}
}
customElements.define(OmnitableItemExpand.is, OmnitableItemExpand);
