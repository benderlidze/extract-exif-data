const fs = require('fs');
const path = require('path');
const ExifParser = require('exif-parser');

const GPX = [];

function extractExifData(filePath) {
    const fileBuffer = fs.readFileSync(filePath);
    const parser = ExifParser.create(fileBuffer);
    const result = parser.parse();
    return result.tags;
}

const lines = [];
function processFolder(folderPath) {
    const line = {
        type: 'Feature',
        properties: {
            name: folderPath,
        },
        geometry: {
            type: 'LineString',
            coordinates: [],
        },
    }
    const files = fs.readdirSync(folderPath);
    files.forEach(file => {
        const filePath = path.join(folderPath, file);
        const stats = fs.statSync(filePath);
        if (stats.isDirectory()) {
            processFolder(filePath);
        } else {
            // If it's a file, check if it's an image and parse EXIF data
            const ext = path.extname(file).toLowerCase();
            if (['.jpg'].includes(ext)) {
                const exifData = extractExifData(filePath);
                //line.geometry.coordinates.push([exifData.GPSLongitude, exifData.GPSLatitude, exifData.GPSAltitude]);
                line.geometry.coordinates.push([exifData.GPSLongitude, exifData.GPSLatitude]);
            }
        }
    });
    line.geometry.coordinates.length > 0 && lines.push(line);
}

const rootFolder = 'Middle Tennesse Tornadoes';
processFolder(rootFolder);

const geojson = {
    type: 'FeatureCollection',
    features: lines,
};
fs.writeFileSync('panos.geojson', JSON.stringify(geojson));
