// xlsx date formatting function from telerik
export const getJsDateFromExcel = (excelDate: number) => {
  const secondsInDay = 24 * 60 * 60;
	const missingLeapYear = secondsInDay * 1000;
	const magicNumberOfDays = 25567 + 2;
	if (!Number(excelDate)) {
		alert('wrong input format');
	}

	const delta = excelDate - magicNumberOfDays;
	const parsed = delta * missingLeapYear;
	const date = new Date(parsed);

	return date;
}
