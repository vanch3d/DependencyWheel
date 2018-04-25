/**
 *
 * @param composerJson
 * @return {{matrix: Array, packageNames: string[], attributes: Object[]}}
 */
export function buildMatrixFromComposerJson(composerJson) {

    /** @namespace composerJson.require */
    let packageNames = Object.keys(composerJson.require);

    /** @namespace composerJson.name */
    packageNames.unshift(composerJson.name);

    let n = packageNames.length;
    let matrix = [];
    matrix[0] = [0];
    let increment = 0;
    // only the first element depends on others
    for (let i = 1; i < n; i++) {
        matrix[0][i] = 1 + increment;
        //matrix[i] = Array.apply(null, new Array(n)).map(Number.prototype.valueOf, 0);
        matrix[i] = [...new Array(n).map(Number.prototype.valueOf, 0)];
        matrix[i][0] = 2;
        increment += 0.001;
    }

    return {
        matrix,
        packageNames,
        attributes: packageNames.map(function(e){
            return {description: e};
        })
    }
}

/**
 *
 * @param composerJson
 * @param composerLock
 * @return {{matrix: Array, packageNames: Array, attributes: Object[]}}
 */
export function buildMatrixFromComposerJsonAndLock(composerJson, composerLock) {

    /** @namespace composerLock.packages */
    let {packages} = composerLock;
    composerJson.isMain = true;
    packages.unshift(composerJson);

    let indexByName = {};
    let packageNames = [];
    let attributes = [];
    let matrix = [];
    let n = 0;
    let replaces = {};

    // List the replacements
    packages.forEach(function (p) {
        if (!p.replace) return;
        for (let replaced in p.replace) {
            if (Object.prototype.hasOwnProperty.call(p.replace, replaced))
                replaces[replaced] = p.name;
        }
    });

    // update required packages with replacements
    packages.forEach(function (p) {
        for (let packageName in p.require) {
            if (packageName in replaces) {
                p.require[replaces[packageName]] = p.require[packageName];
                delete p.require[packageName];
            }
        }
    });

    // Compute a unique index for each package name.
    packages.forEach(function (p) {
        let packageName = p.name;
        if (!(packageName in indexByName)) {
            packageNames[n] = packageName;
            attributes[n] = p;
            indexByName[packageName] = n++;
        }
    });

    // Construct a square matrix counting package requires.
    packages.forEach(function (p) {
        let source = indexByName[p.name];
        let row = matrix[source];
        if (!row) {
            row = matrix[source] = [];
            for (let i = -1; ++i < n;) row[i] = 0;
        }
        for (let packageName in p.require) {
            if (Object.prototype.hasOwnProperty.call(p.require, packageName))
                row[indexByName[packageName]]++;
        }
    });

    // add small increment to equally weighted dependencies to force order
    matrix.forEach(function (row, index) {
        let increment = 0.001;
        for (let i = -1; ++i < n;) {
            let ii = (i + index) % n;
            if (row[ii] === 1) {
                row[ii] += increment;
                increment += 0.001;
            }
        }
    });

    return {
        matrix,
        packageNames,
        attributes
    }
}
