import '@webcomponents/shadycss/entrypoints/apply-shim';

import '@neovici/paper-autocomplete-chips';

import { PolymerElement } from '@polymer/polymer/polymer-element';
import { html } from '@polymer/polymer/lib/utils/html-tag';

import { translatable } from '@neovici/cosmoz-i18next';
import { columnMixin } from './cosmoz-omnitable-column-mixin';
import { listColumnMixin } from './cosmoz-omnitable-column-list-mixin';

/**
 * @polymer
 * @customElement
 * @appliesMixin listColumnMixin
 * @appliesMixin columnMixin
 */
class OmnitableColumnListHorizontal extends listColumnMixin(
	columnMixin(
		translatable(
			PolymerElement
		)
	)
) {
	static get template() {
		return html`
		<template class="cell" strip-whitespace>
			<style>
				ul {
					display: inline;
					list-style: none;
				}
				ul li {
					display: inline;
				}
				ul li:after {
					content: ", ";
				}
				ul li:last-child:after {
					content: "";
				}
			</style>
			<ul>
				<template is="dom-repeat" items="[[ get(valuePath, item) ]]" as="listitem">
					<li>[[ listitem ]]</li>
				</template>
			</ul>
		</template>

		<template class="edit-cell" strip-whitespace>
			<paper-input no-label-float type="text" on-change="_valueChanged" value="[[ getString(item, valuePath) ]]"></paper-input>
		</template>

		<template class="header" strip-whitespace>
			<paper-autocomplete-chips source="[[ _computeAutocompleteItems(values) ]]"
				label="[[ title ]]" selected-items="{{ filter }}" text-property="[[ textProperty ]]" value-property="[[ valueProperty ]]" show-results-on-focus>
			</paper-autocomplete-chips>
		</template>
`;
	}

	static get is() {
		return 'cosmoz-omnitable-column-list-horizontal';
	}

	static get properties() {
		return {
			autocompleteSelectedItems: {
				type: Array
			},

			/**
			 * Ask for a list of values
			 */
			bindValues: {
				type: Boolean,
				readOnly: true,
				value: true
			},

			filter: {
				type: Array,
				notify: true,
				value() {
					return this._getDefaultFilter();
				}
			}
		};
	}

	_computeAutocompleteItems(values = this.values) {
		const unique = [];
		return values
			.reduce((acc, val) => acc.concat(val), [])
			// Make the item list unique
			.filter((value, index, array) => {
				if (array.indexOf(value) !== index) {
					return false;
				}
				const val = this.valueProperty ? this.get(this.valueProperty, value) : value,
					hasVal = unique.indexOf(val) !== -1;

				if (hasVal) {
					return false;
				}
				unique.push(val);
				return true;
			})
			.sort();
	}

	_getLabelForValue(value) {
		if (value == null) {
			return null;
		}
		return value.toString();
	}

	_applySingleFilter(filterString, item) {
		const value = this.get(this.valuePath, item);
		if (value == null) {
			return false;
		}
		return value.toString().toLowerCase() === filterString;
	}

	_applyMultiFilter(filter, item) {
		const valueFilter = element => {
				const value = this.valueProperty ? this.get(this.valueProperty, element) : element;
				return value ? value.toString().toLowerCase() : null;
			},
			filterArray = filter.map(valueFilter),
			listValue = this.get(this.valuePath, item);

		if (listValue == null) {
			return filter.length === 0;
		}

		return listValue
			.map(valueFilter)
			.some(val => filterArray.indexOf(val) >= 0);
	}

	_getDefaultFilter() {
		return [];
	}
}

customElements.define(
	OmnitableColumnListHorizontal.is,
	OmnitableColumnListHorizontal
);
