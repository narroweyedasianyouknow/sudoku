import { writable } from 'svelte/store';
import { filled_counts, sudoku_store } from './sudoku_store';
import { add_to_level_history, type LevelHistory } from './level_history';
type ActiveFieldStore = {
	active_column: number;
	active_row: number;
	active_solved_value: {
		value: number;
		state: string;
	};
	active_value: number;
};
/** Active selected field */
export const active_field = writable<ActiveFieldStore>({
	active_column: 0,
	active_row: 0,
	active_solved_value: {
		value: 0,
		state: 'none'
	},
	active_value: 0
});
export function set_active_field(value: number, store: ActiveFieldStore, is_settled?: boolean) {
	const { active_row, active_column, active_solved_value, active_value } = store;

	/** Check if `value` is number */
	if (Number.isNaN(value)) return false;

	const is_does_not_solved = active_value !== active_solved_value.value;
	const is_solved = value === active_solved_value.value;

	if (is_does_not_solved) {
		sudoku_store.update(({ unsolved_grid, solved_grid, errors_count }) => {
			unsolved_grid[active_row][active_column].value = value;
			if (is_settled) {
				add_to_level_history(
					is_solved ? 'ok' : 'err',
					unsolved_grid[active_row][active_column].state,
					active_row,
					active_column,
					active_value,
					value
				);
			}
			unsolved_grid[active_row][active_column].state = is_solved ? 'ok' : 'err';
			return {
				unsolved_grid,
				solved_grid,
				errors_count: !is_solved ? errors_count + 1 : errors_count
			};
		});

		if (is_solved) {
			filled_counts.update(({ solved, unsolved }) => ({
				solved: solved + 1,
				unsolved: unsolved - 1
			}));
		}
	}
}
export function set_field(value: LevelHistory) {
	const { column, prev, row, settled, state, prev_state } = value;
	const is_does_not_solved = prev !== settled;
	const is_solved = state === 'ok';

	if (is_does_not_solved) {
		sudoku_store.update(({ unsolved_grid, solved_grid, errors_count }) => {
			unsolved_grid[row][column].value = value.prev;
			unsolved_grid[row][column].state = prev_state;
			return {
				unsolved_grid,
				solved_grid,
				errors_count: errors_count
			};
		});

		filled_counts.update(({ solved, unsolved }) => ({
			solved: is_solved ? solved - 1 : solved + 1,
			unsolved: is_solved ? unsolved + 1 : unsolved - 1
		}));
	}
}
