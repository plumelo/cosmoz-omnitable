import '@webcomponents/shadycss/entrypoints/apply-shim';
import '@polymer/iron-flex-layout/iron-flex-layout';

const container = document.createElement('template');

container.innerHTML = `<dom-module id="cosmoz-omnitable-styles">
	<template>
		<style>
			:host {
				@apply --layout-vertical;
				@apply --layout-relative;
				overflow: hidden;
			}

			:host a {
				color: var(--primary-link-color, inherit);
			}

			/* The wrapping div that contains the header, the table content and the footer */
			.mainContainer {
				background-color: #fff;
				@apply --layout-vertical;
				@apply --layout-flex;

			}

			#columns {
				display: none;
			}

			.header {
				@apply --layout-relative;
				@apply --layout-horizontal;
				@apply --layout-end;
			}

			.header > cosmoz-omnitable-header-row {
				@apply --layout-flex;
			}

			.header paper-autocomplete,
			.header paper-autocomplete-chips {
				--suggestions-item: {
					white-space: nowrap;
				};
				--paper-autocomplete-suggestions-wrapper: {
					width: auto;
					min-width: 100%;
				};
			}
			.header-cell > * {
				width: 100%;
			}

			.time-header-cell,
			.datetime-header-cell,
			.date-header-cell,
			.amount-header-cell,
			.number-header-cell {
				position: relative;
			}

			.tableContent {
				overflow-y: auto;
				min-height: 90px;
				@apply --layout-vertical;
				@apply --layout-flex;
				@apply --layout-relative;
			}

			/* Empty data set styling */

			.tableContent-empty {
				@apply --layout-fit;
				@apply --layout-horizontal;
				@apply --layout-center;
				@apply --layout-center-justified;
				color: #ccc;
			}

			.tableContent-empty.overlay {
				background-color: rgba(255, 255, 255, 0.8);
				color: #333;
				z-index: 1;
			}


			.tableContent-empty iron-icon {
				height: 96px;
				min-height: 96px;
				width: 96px;
				min-width: 96px;
				margin-right: 24px;
			}

			.tableContent-empty.overlay paper-spinner-lite {
				height: 48px;
				min-height: 48px;
				width: 48px;
				min-width: 48px;
				margin-right: 24px;
				--paper-spinner-color: #333;
				--paper-spinner-stroke-width: 6px;
			}

			.tableContent-empty > div {
				@apply --layout-vertical;
				@apply --layout-center-justified;
				padding-bottom: 24px;
			}

			.tableContent-empty.overlay > div {
				padding-bottom: 0;
			}

			.tableContent-empty p {
				font-size: 15px;
				color: #ddd;
				margin: 0;
			}

			.tableContent-empty h3 {
				white-space: nowrap;
				margin: 0px 0px 8px 0px;
			}

			/* End of empty data set styling */


			.tableContent-scroller {
				@apply --layout-flex;
				position: relative;
				overflow: auto;
				will-change: transform;
			}

			#groupedList {
				@apply --layout-fit;
			}

			.footer {
				@apply --layout-horizontal;
				@apply --layout-center;
				border-top: solid 1px #e8e8e8;
				background-color: #f5f5f5;
				min-height: 25px;
				height: 63px;
				margin-bottom: 1px; /* Chrome overflow rendering bug? When only component in a view */
			}

			.footer-controls {
				@apply --layout-horizontal;
				@apply --layout-flex;
				@apply --layout-center;
			}

			.footer-control {
				margin-left: 3%;
				@apply --layout-horizontal;
				@apply --layout-center;
			}

			.footer-tableStats {
				@apply --layout-vertical;
				@apply --layout-end;
				margin-right: 3%;
			}


			.footer-tableStats :first-child {
				margin-bottom: 5px;
			}

			.footer-control-label {
				margin-right: 10px;
			}

			.selectAllCheckbox,
			.selectItemCheckbox,
			.selectGroupCheckbox {
				min-width: 32px;
				max-width: 32px;
				width: 32px;
				padding: 1px 1px 1px 1px;
				text-align: center;
				vertical-align: middle;
				margin-left: 10px;
			}

			.selectAllCheckbox {
				padding-bottom: 14px;
			}

			.item-row-wrapper {
				display: block;
				width: 100%;
			}

			.itemRow {
				border-bottom-color: #e2e2e2;
				border-bottom-width: 1px;
				border-bottom-style: var(--cosmoz-omnitable-item-row-border-bottom-style, solid);
				/* set a min-height for rows so that rows with empty values are visible */
				min-height: 24px;
				padding-right: 8px;
				@apply --layout-horizontal;
				@apply --layout-center;
			}

			.itemRow[selected] {
				background-color: rgb(195, 212, 248) !important;
				@apply --cosmoz-omnitable-selected-row;
			}

			.itemRow[highlighted] {
				background-color: rgba(195, 212, 248, 0.5);
				@apply --cosmoz-omnitable-hightlighted-row;
			}

			.tableContent .itemRow-cell paper-dropdown-menu {
				margin-top:-20px;
			}

			.item-expander paper-icon-button {
				min-height: 24px;
				max-height: 24px;
				padding: 0;
			}

			.groupRow {
				@apply --layout-horizontal;
				@apply --layout-center;
				background-color: #efefef;
				font-weight: 400;
				color: #48515b;
				height: 44px;
				border-bottom: solid 1px #d6d6d6;
			}

			.groupRow.groupRow-folded {
				/* Add here style rules for folded group rows */
			}

			.groupRow-label {
				@apply --layout-flex;
				@apply --layout-horizontal;
				padding-left: 8px;
				margin: 0;
				font-size: 1.15em;
				font-weight: 400;
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
			}

			.groupRow-label > cosmoz-omnitable-group-row {
				@apply --layout-flex;
			}

			.rtl {
				direction: rtl;
			}

			.align-left {
				text-align: left;
			}

			.align-right {
				text-align: right;
			}

			cosmoz-bottom-bar {
				background-color: var(--cosmoz-omnitable-bottom-bar-color, #5f5a92);
				color: white;
			}

			cosmoz-bottom-bar::slotted(*) {
				background-color: #4c4875;
				color: #fff;
				border-color: #fff;
			}

			cosmoz-bottom-bar::slotted([disabled]) {
				color: #b7b6c8;
				border-color: #b7b6c8;
				cursor: not-allowed;
			}

			#dropdownExtra paper-button {
				display: flex;
				@apply --layout-center;
				@apply --layout-horizontal;
				position: relative;
				@apply --cosmoz-bottom-bar-menu-item;
			}

			#dropdownExtra {
				padding: 0;
			}

			#listboxSizer {
				max-height: 0;
				padding: 0 !important;
			}

			#dropdownExtraButton {
				color: var(--cosmoz-bottom-bar-menubutton-color, var(--light-primary-color));
				background-color: var(--cosmoz-bottom-bar-menubutton-background-color, var(--dark-primary-color));
			}
		</style>
	</template>
</dom-module>`;

document.head.appendChild(container.content);
