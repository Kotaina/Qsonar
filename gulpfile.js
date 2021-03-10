"use strict";

var gulp = require("gulp");
var plumber = require("gulp-plumber");
var sourcemap = require("gulp-sourcemaps");
var sass = require("gulp-sass");
var postcss = require("gulp-postcss");
var autoprefixer = require("autoprefixer");
var server = require("browser-sync").create();
var rename = require("gulp-rename");
var posthtml = require("gulp-posthtml");
var include = require("posthtml-include");
var del = require("del");
var csso = require("gulp-csso");

gulp.task("clean", function () {
    return del("build");
});

gulp.task("copy", function () {
    return gulp.src([
        "source/fonts/**/*.{ttf,woff,woff2}",
        "source/img/**",
        "source/js/**",
        "source/*.ico",
        "source/data/*"
    ], {
        base: "source"
    })
        .pipe(gulp.dest("build"));
});

gulp.task("delete-docs", function () {
    return del("docs");
});

gulp.task("fill-docs", function () {
    return gulp.src([
        "build/**"
    ], {
        base: "build"
    })
        .pipe(gulp.dest("docs"));
});


gulp.task("css", function () {
    return gulp.src("source/sass/style.scss")
        .pipe(plumber())
        .pipe(sourcemap.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(postcss([
            autoprefixer()
        ]))
        .pipe(csso())
        .pipe(gulp.dest("build/css"))
        .pipe(rename("style.min.css"))
        .pipe(sourcemap.write("."))
        .pipe(gulp.dest("build/css"))
        .pipe(server.stream());
});

gulp.task("html", function () {
    return gulp.src("source/*.html")
        .pipe(posthtml([
            include()
        ]))
        .pipe(gulp.dest("build"));
})

gulp.task("server", function () {
    server.init({
        server: "build/",
        notify: false,
        open: true,
        cors: true,
        ui: false
    });

    gulp.watch("source/sass/**/*.scss", gulp.series("css"));
    gulp.watch("source/img/icon-*.svg", gulp.series("html", "refresh"));
    gulp.watch("source/*.html").on("change", gulp.series("html", "refresh"));
});

gulp.task("refresh", function (done) {
    server.reload();
    done();
});

gulp.task("build", gulp.series("clean", "copy", "css", "html"));
gulp.task("start", gulp.series("build", "server"));

gulp.task("publish", gulp.series("delete-docs", "fill-docs"));