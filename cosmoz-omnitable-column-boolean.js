import '@webcomponents/shadycss/entrypoints/apply-shim';
import '@polymer/paper-dropdown-menu/paper-dropdown-menu';
import '@polymer/paper-listbox/paper-listbox';
import '@polymer/paper-item/paper-item';

import { PolymerElement } from '@polymer/polymer/polymer-element';
import { html } from '@polymer/polymer/lib/utils/html-tag';

import { columnMixin } from './cosmoz-omnitable-column-mixin';

/**
 * @polymer
 * @customElement
 * @appliesMixin columnMixin
 */
class OmnitableColumnBoolean extends columnMixin(PolymerElement) {
	static get template() {
		return html`
		<template class="cell" strip-whitespace>
			[[ getString(item, valuePath) ]]
		</template>

		<template class="edit-cell" strip-whitespace>
			<paper-dropdown-menu>
				<paper-listbox class="dropdown-content" slot="dropdown-content"
					attr-for-selected="value" selected="[[ _computeSelected(item, valuePath) ]]" on-selected-item-changed="_valueChanged">
					<paper-item value="true">[[ trueLabel ]]</paper-item>
					<paper-item value="false">[[ falseLabel ]]</paper-item>
				</paper-listbox>
			</paper-dropdown-menu>
		</template>

		<template class="header" strip-whitespace>
			<paper-dropdown-menu label="[[ title ]]" horizontal-align="[[ preferredDropdownHorizontalAlign ]]" opened="{{ headerFocused }}">
				<paper-listbox class="dropdown-content" slot="dropdown-content" attr-for-selected="value" selected="{{ _textFilter }}">
					<paper-item value></paper-item>
					<paper-item value="true">[[ trueLabel ]]</paper-item>
					<paper-item value="false">[[ falseLabel ]]</paper-item>
				</paper-listbox>
			</paper-dropdown-menu>
		</template>
`;
	}

	static get is() {
		return 'cosmoz-omnitable-column-boolean';
	}

	static get properties() {
		return {
			filter: {
				type: Boolean,
				notify: true,
				value() {
					return this._getDefaultFilter();
				}
			},

			trueLabel: {
				type: String,
				value: 'True'
			},

			falseLabel: {
				type: String,
				value: 'False'
			},

			_textFilter: {
				type: String,
				observer: '_textFilterChanged'
			},

			templatetemplateWidth: {
				type: String,
				value: '60px'
			},

			/**
			 * No need to grow, as the values in a boolean column should have known fixed width
			 * @returns {String} Default flex
			 */
			flex: {
				type: String,
				value: '0'
			}
		};
	}

	static get observers() {
		return [
			'_filterChanged(filter)'
		];
	}

	// TODO(pasleq): same questions as for cosmoz-omnitable-column-date

	_textFilterChanged(textFilter) {
		if (this._filterChangedFromAbove) {
			this._filterChangedFromAbove = false;
			return;
		}
		this._filterChangedFromInput = true;
		if (textFilter) {
			this.set('filter', textFilter === 'true');
		} else {
			this.set('filter', null);
		}
	}

	_filterChanged(filter) {
		if (this._filterChangedFromInput) {
			this._filterChangedFromInput = false;
			return;
		}
		this._filterChangedFromAbove = true;
		this._textFilter = typeof filter === 'boolean' ? filter.toString() : null;
	}

	getString(item, valuePath) {
		const value = this.get(valuePath || this.valuePath, item);
		return value ? this.trueLabel : this.falseLabel;
	}

	getFilterFn() {
		if (this.filter != null) {
			return this._applySingleFilter.bind(this);
		}
	}

	_applySingleFilter(item) {
		return this.get(this.valuePath, item) === this.filter;
	}

	_computeSelected(item, valuePath) {
		const value = this.get(valuePath || this.valuePath, item);
		if (value != null) {
			return value.toString();
		}
	}

	/** OVERRIDES */

	_valueChanged(e) {
		const value = e.target.selected === 'true',
			item = e.model.item,
			oldValue = this.get(this.valuePath, item),
			formatFn = value => {
				return value ? this.trueLabel : this.falseLabel;
			};
		if (value === oldValue) {
			return;
		}
		this.set(this.valuePath, value, item);
		this._fireItemChangeEvent(item, this.valuePath, oldValue, formatFn.bind(this));
	}

	_serializeFilter(obj = this.filter) {
		if (obj == null || obj === '') {
			return null;
		}
		return this._serializeValue(obj ? 'true' : 'false');
	}

	_deserializeFilter(obj) {
		const value = this._deserializeValue(obj, String);

		if (value === 'true') {
			return true;
		}

		if (value === 'false') {
			return false;
		}

		return null;
	}

	toXlsxValue(item, valuePath = this.valuePath) {
		if (!valuePath) {
			return '';
		}
		return this.get(valuePath, item) ? this.trueLabel : this.falseLabel;
	}
}
customElements.define(OmnitableColumnBoolean.is, OmnitableColumnBoolean);
