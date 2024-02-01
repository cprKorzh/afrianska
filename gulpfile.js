const { src, dest, watch, parallel, series } = require("gulp"); // Gulp's фичи
const scss = require("gulp-sass")(require("sass")); // Преобразования стилей
const concat = require("gulp-concat"); // Конкатенация файлов
const uglify = require("gulp-uglify-es").default; // Сжатие файлов
const browserSync = require("browser-sync").create(); // Синхронизация браузера
const autoprefixer = require("autoprefixer"); // Авто замена стилей для старых браузеров
const postcss = require("gulp-postcss"); // Дополнение к автопрефиксеру
const del = require('del'); // npm install del@3.0.0 --save-dev - Удаление предыдущего билда
const imagemin = require("gulp-imagemin"); // npm i gulp-imagemin@7.1.0 --save-dev - Минимизация картинок
const fonter = require("gulp-fonter"); //npm i gulp-fonter --save-dev - Преобразование шрифта
const ttf2woff2 = require("gulp-ttf2woff2"); //npm i gulp-ttf2woff2 --save-dev - Преобразование шрифта
const setInclude = require("gulp-include"); //npm i gulp-include --save-dev - Использование включающих частей кода

function fonts() {
    return src('app/fonts/src/*.*')
        .pipe(fonter({
            formats: ['woff', 'ttf']
        }))
        .pipe(src('app/fonts/*.ttf'))
        .pipe(ttf2woff2())
        .pipe(dest('app/fonts/'))
}

function images() {
    return src(['app/img/src/*.svg'])
        .pipe(imagemin())
        .pipe(dest('app/img/'))
}

function unionHyperText() {
    return src('app/pages/*.html')
        .pipe(setInclude({
            includePaths: 'app/components'
        }))
        .pipe(dest('app/'))
        .pipe(browserSync.stream())
}

function styles() {
    return src('app/scss/style.scss')
        .pipe(postcss([ autoprefixer() ]))
        .pipe(concat('style.min.css'))
        .pipe(scss({outputStyle: 'compressed'}))
        .pipe(dest('app/css'))
        .pipe(browserSync.stream())
}

function scripts() {
    return src([
        'app/js/*.js',
        '!app/js/main.min.js'
        ])
        .pipe(concat('main.min.js'))
        .pipe(uglify())
        .pipe(dest('app/js'))
        .pipe(browserSync.stream())
}

function browserRefrehs() {
    browserSync.init({
        server: {
            baseDir: "app/"
        }
    });
}

function watching() {
    browserRefrehs();
    watch(['app/scss/style.scss'], styles).on('change', browserSync.reload);
    watch(['app/components/*', 'app/pages/*'], unionHyperText).on('change', browserSync.reload);
    watch(['app/**/*.html']).on('change', browserSync.reload);
    watch(['app/js/main.js'], scripts).on('change', browserSync.reload);
}

function cleanDist() {
    return del(['css', 'fonts', 'img', 'js', 'index.html']);
}

function clearWorkSpace() {
    return del(['app/fonts/*.*', 'app/img/*.*']);
}

function building() {
    return src([
        'app/img/*.*',
        'app/fonts/*.*',
        'app/css/style.min.css',
        'app/js/main.min.js',
        'app/index.html'
    ], {base: 'app'})
        .pipe(dest('./'))
}

exports.styles = styles;
exports.scripts = scripts;
exports.unionHyperText = unionHyperText;
exports.watching = watching;
exports.browserRefrehs = browserRefrehs;

exports.build = series (cleanDist, images, fonts, building, clearWorkSpace);
exports.default = parallel (styles, scripts, unionHyperText, watching);