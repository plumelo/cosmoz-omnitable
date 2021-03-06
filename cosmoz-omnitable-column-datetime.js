import '@webcomponents/shadycss/entrypoints/apply-shim';

import '@polymer/paper-dropdown-menu/paper-dropdown-menu';
import '@neovici/cosmoz-datetime-input';
import './ui-helpers/cosmoz-clear-button';

import { dateColumnMixin } from './cosmoz-omnitable-column-date-mixin';
import { columnMixin } from './cosmoz-omnitable-column-mixin';
import { translatable } from '@neovici/cosmoz-i18next';
import { PolymerElement } from '@polymer/polymer/polymer-element';
import { html } from '@polymer/polymer/lib/utils/html-tag';
window.Cosmoz = window.Cosmoz || {};

/**
 * @polymer
 * @customElement
 * @appliesMixin dateColumnMixin
 * @appliesMixin columnMixin
 */
class OmnitableColumnDatetime extends
	dateColumnMixin(
		columnMixin(
			translatable(PolymerElement)
		)
	) {
	static get template() {
		return html`
		<template class="cell" strip-whitespace>
			[[ getString(item, valuePath, formatter) ]]
		</template>

		<template class="edit-cell" strip-whitespace>
			<cosmoz-datetime-input no-label-float type="cosmoz-datetime-input" on-change="_dateValueChanged" value="[[ getInputString(item, valuePath) ]]">
			</cosmoz-datetime-input>
		</template>

		<template class="header" strip-whitespace>
			<cosmoz-clear-button on-click="resetFilter" visible="[[ hasFilter(filter.*) ]]"></cosmoz-clear-button>
			<paper-dropdown-menu label="[[ title ]]" placeholder="[[ _filterText ]]"
				title="[[ _tooltip ]]" horizontal-align="[[ preferredDropdownHorizontalAlign ]]" opened="{{ headerFocused }}">
				<div class="dropdown-content" slot="dropdown-content" style="padding: 15px; min-width: 100px;">
					<h3 style="margin: 0;">[[ title ]]</h3>
					<cosmoz-datetime-input date-label="[[ _('From date', t) ]]" time-label="[[ _('From time', t) ]]"
						min="[[ _toInputString(_limit.fromMin) ]]" max="[[ _toInputString(_limit.fromMax) ]]" value="{{ _filterInput.min }}" step$="[[ filterStep ]]">
					</cosmoz-datetime-input>
					<cosmoz-datetime-input date-label="[[ _('To date', t) ]]" time-label="[[ _('To time', t) ]]"
						min="[[ _toInputString(_limit.toMin) ]]" max="[[ _toInputString(_limit.toMax) ]]" value="{{ _filterInput.max }}" step$="[[ filterStep ]]">
					</cosmoz-datetime-input>
				</div>
			</paper-dropdown-menu>
		</template>
`;
	}

	static get is() {
		return 'cosmoz-omnitable-column-datetime';
	}

	static get properties() {
		return {
			filterStep: {
				type: Number,
				value: 1
			},

			width: {
				type: String,
				value: '210px'
			},

			editWidth: {
				type: String,
				value: '320px'
			},

			minWidth: {
				type: String,
				value: '128px'
			},

			editMinWidth: {
				type: String,
				value: '128px'
			},

			headerCellClass: {
				type: String,
				value: 'datetime-header-cell'
			}
		};
	}

	_toInputString(value) {
		const date = this.toValue(value);
		if (date == null) {
			return;
		}
		return this._toLocalISOString(date).slice(0, 19);
	}

	_toHashString(value) {
		const date = this.toValue(value);
		if (date == null) {
			return '';
		}
		//Use utc in hash
		return date.toISOString().slice(0, 19).replace(/:/gu, '.');
	}

	_fromHashString(value) {
		if (value == null || value === '') {
			return;
		}
		//Parse utc from hash string
		return this.toValue(value.replace(/\./gu, ':') + 'Z');
	}

	toXlsxValue(item, valuePath = this.valuePath) {
		if (!valuePath) {
			return '';
		}
		return this.get(valuePath, item);
	}

	// OVERRIDES
	_computeFormatter(locale) {
		const timeFormatOption = {
			year: 'numeric',
			month: 'numeric',
			day: 'numeric',
			hour: 'numeric',
			minute: 'numeric'
		};
		return new Intl.DateTimeFormat(locale || undefined, timeFormatOption);
	}
}

customElements.define(OmnitableColumnDatetime.is, OmnitableColumnDatetime);
