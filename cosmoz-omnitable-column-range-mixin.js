import '@webcomponents/shadycss/entrypoints/apply-shim.js';

import { dedupingMixin } from '@polymer/polymer/lib/utils/mixin.js';
import { Debouncer } from '@polymer/polymer/lib/utils/debounce.js';
import { timeOut } from '@polymer/polymer/lib/utils/async.js';
import { enqueueDebouncer } from '@polymer/polymer/lib/utils/flush.js';

/**
 * @polymer
 * @mixinFunction
 * @param {class} base The base class
 * @returns {class} The base class with the mixin applied
 */
export const rangeColumnMixin = dedupingMixin(base => // eslint-disable-line max-lines-per-function
	/**
	 * @polymer
	 * @mixinClass
	 */
	class extends base {
		static get properties() {
			return {
				bindValues: {
					type: Boolean,
					readOnly: true,
					value: true
				},

				values: {
					type: Array,
					value() {
						return [];
					}
				},

				min: {
					type: Number,
					value: null
				},

				max: {
					type: Number,
					value: null
				},

				locale: {
					type: String,
					value: null
				},

				_filterInput: {
					type: Object,
					value() {
						return { min: null, max: null };
					}
				},

				_range: {
					type: Object,
					computed: '_computeRange(values.*)'
				},

				_limit: {
					type: Object,
					computed: '_computeLimit(_range, _filterInput.*, min, max)',
					value() {
						return {};
					}
				},

				_tooltip: {
					type: String,
					computed: '_computeTooltip(title, _filterText)'
				}
			};
		}

		static get observers() {
			return [
				'_filterInputChanged(_filterInput.*)',
				'_filterChanged(filter.*)'
			];
		}

		disconnectedCallback() {
			this._limitInputDebouncer.cancel();
			super.disconnectedCallback();
		}

		/**
		 * Converts a value to number optionaly limiting it.
		 *
		 * @param	 {Number|*} value	 The value to convert to number
		 * @param	 {Number|*} limit	 The value used to limit the number
		 * @param	 {Function} limitFunc	 The function used to limit the number (Math.min|Math.max)
		 * @returns {Number|void}		 Value converted to Number or void
		 */
		toNumber(value, limit, limitFunc) {
			if (value == null || value === '') {
				return;
			}
			const number = typeof value === 'number' ? value : Number(value);
			if (Number.isNaN(number)) {
				return;
			}
			if (limitFunc == null || limit == null) {
				return number;
			}
			const lNumber = this.toNumber(limit);
			if (lNumber == null) {
				return number;
			}
			return limitFunc(number, lNumber);
		}

		toValue() {
			return this.toNumber.apply(this, arguments);
		}

		/**
		 *	 Get the comparable value of an item.
		 *
		 * @param	 {Object} item			 Item to be processed
		 * @param	 {String} valuePath	 Property path
		 * @returns {Number|void}			 Valid value or void
		 */
		getComparableValue(item, valuePath) {
			if (item == null) {
				return;
			}
			let value = item;
			if (valuePath != null) {
				value = this.get(valuePath, item);
			}
			return this.toValue(value);
		}

		toXlsxValue(item, valuePath = this.valuePath) {
			const value = this.getComparableValue(item, valuePath);
			if (value == null) {
				return '';
			}
			return value;
		}

		getString(item, valuePath = this.valuePath) {
			if (valuePath === undefined) {
				console.error(this, 'has undefined valuePath', valuePath, 'for item', item);
				return;
			}
			const value = this.get(valuePath, item);
			if (value == null) {
				return '';
			}
			return this.renderValue(value);
		}
		renderValue() {
			//overrideable
		}

		getInputString(item, valuePath = this.valuePath) {
			const value = this.toValue(this.get(valuePath, item));
			return this._toInputString(value);
		}

		/**
		 * Computes min/max range from values.
		 *
		 * @param	 {Object} change `values` property changes
		 * @returns {Object} Computed min/max
		 */
		_computeRange(change) {
			const allValues = change.base,
				values = Array.isArray(allValues) && allValues.length
					&& allValues.map(v => this.toValue(v)).filter(n => n != null);

			if (!values || values.length < 1) {
				return {
					min: null,
					max: null
				};
			}
			return values.reduce((p, n) => {
				return {
					min: this.toValue(n, p.min, Math.min),
					max: this.toValue(n, p.max, Math.max)
				};
			}, {});
		}

		_computeLimit(range, inputChange, min, max) {
			if (!range) {
				return;
			}
			const input = inputChange.base,
				nMin = this.toValue(min),
				nMax = this.toValue(max),
				aMin = nMin != null ? nMin : this.toValue(range.min),
				aMax = nMax != null ? nMax : this.toValue(range.max);

			return {
				fromMin: aMin,
				fromMax: this.toValue(aMax, this._fromInputString(input.max, 'max'), Math.min),
				toMin: this.toValue(aMin, this._fromInputString(input.min, 'min'), Math.max),
				toMax: aMax
			};
		}

		getFilterFn() {
			const min = this.getComparableValue(this.filter, 'min'),
				max = this.getComparableValue(this.filter, 'max');

			if (min == null && max == null) {
				return;
			}
			return this._applySingleFilter.bind(this, this.filter);
		}

		_applySingleFilter(filter, item) {
			const value = this.getComparableValue(item, this.valuePath),
				minValue = this.getComparableValue(filter, 'min'),
				maxValue = this.getComparableValue(filter, 'max');

			if (value < minValue) {
				return false;
			}

			if (value > maxValue) {
				return false;
			}

			return true;
		}

		_computeFilterText(change) {
			if (change.base == null) {
				return null;
			}
			const filter = change.base,
				min = this.toValue(filter.min),
				max = this.toValue(filter.max),
				text = [];

			if (min != null) {
				text.push(this.renderValue(min));
			}
			text.push(' - ');
			if (max != null) {
				text.push(this.renderValue(max));
			}
			return text.length > 1 ? text.join('') : null;
		}

		_computeTooltip(title, text) {
			if (text == null) {
				return title;
			}
			return `${title}: ${text}`;
		}

		_fromInputString(value) {
			return this.toValue(value);
		}

		_toInputString(value) {
			const val = this.toValue(value);
			if (val == null) {
				return null;
			}
			return val;
		}

		_getDefaultFilter() {
			return {
				min: null,
				max: null
			};
		}

		/**
		 * Observes changes of _filterInput, saves the path, debounces _limitInput.
		 *
		 * @param	 {Object} change '_filterInput' property changes
		 * @returns {void}
		 */
		_filterInputChanged(change) {
			const path = change.path.split('.')[1];
			this.__inputChangePath = path || null;

			this._limitInputDebouncer = Debouncer.debounce(
				this._limitInputDebouncer,
				timeOut.after(600),
				() => this._limitInput()
			);
			enqueueDebouncer(this._limitInputDebouncer);
		}

		/**
		 * Debounced function called by `_filterInputChanged` when `_filterInput` changes.
		 * @returns {void}
		 */
		_limitInput() {
			const input = this._filterInput,
				path = this.__inputChangePath,
				value = path ? this._fromInputString(this.get(path, input), path) : null;

			this.__inputChangePath = null;

			if (value == null) {
				//Don't limit a null value
				return this._updateFilter();
			}

			const limit = this._limit,
				limitPath = path === 'min' ? 'from' : 'to',
				lowerLimit = this.get(limitPath + 'Min', limit),
				upperLimit = this.get(limitPath + 'Max', limit),
				minValue = this.toValue(value, lowerLimit, Math.max),
				limitedValue = this.toValue(minValue, upperLimit, Math.min);

			if (this.getComparableValue(value) !== this.getComparableValue(limitedValue)) {
				//set value without debouncing _limitInput again.
				this.set(['_filterInput', path], this._toInputString(limitedValue, path));
				this._limitInputDebouncer.cancel();
			}

			this._updateFilter();
		}

		_updateFilter() {
			const input = this._filterInput,
				filter = this.filter,
				min = this._fromInputString(input.min, 'min'),
				max = this._fromInputString(input.max, 'max');

			if (this.getComparableValue(min) === this.getComparableValue(filter, 'min')
				&& this.getComparableValue(max) === this.getComparableValue(filter, 'max')
			) {
				return;
			}

			this.set('filter', { min, max });
		}

		_filterChanged(change) {
			if (this._filterInput == null) {
				return;
			}
			const input = this._filterInput,
				filter = change.base,
				min = this._fromInputString(input.min, 'min'),
				max = this._fromInputString(input.max, 'max');

			if (this.getComparableValue(min) === this.getComparableValue(filter, 'min')
				&& this.getComparableValue(max) === this.getComparableValue(filter, 'max')
			) {
				return;
			}

			this.set('_filterInput', {
				min: this._toInputString(filter.min),
				max: this._toInputString(filter.max)
			});
			this._limitInputDebouncer.cancel();
		}

		hasFilter() {
			const filter = this.filter,
				isSet = super.hasFilter.apply(this, arguments);
			if (!isSet) {
				return false;
			}
			return this.toValue(filter.min) != null || this.toValue(filter.max) != null;
		}

		_serializeFilter(filter = this.filter) {
			if (filter == null) {
				return;
			}
			const min = this.toValue(filter.min),
				max = this.toValue(filter.max);

			if (min == null && max == null) {
				return;
			}
			return this._toHashString(min) + '~' + this._toHashString(max);
		}

		_deserializeFilter(obj) {
			if (obj == null || obj === '') {
				return null;
			}
			const matches = obj.match(/^([^~]+)?~([^~]+)?/iu);

			if (!Array.isArray(matches)) {
				return null;
			}

			return {
				min: this._fromHashString(matches[1], 'min'),
				max: this._fromHashString(matches[2], 'max')
			};
		}

		_toHashString(value) {
			const string = this._toInputString(value);
			if (string == null) {
				return '';
			}
			return string;
		}

		_fromHashString(value, property) {
			return this._fromInputString(value, property);
		}
	}
);
