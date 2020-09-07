export namespace Utils {

    /**
     * Checks if a given number is an integer.
     *
     * @param num number to check for.
     * @returns true if the given number is an integer, returns false otherwise.
     */
    export const isInteger = (num: number): boolean => {

        // https://stackoverflow.com/questions/3885817/how-do-i-check-that-a-number-is-float-or-integer
        return num % 1 === 0;
    };

}
