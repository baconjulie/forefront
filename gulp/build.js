import gulp from 'gulp'
import del from 'del'
import sourcemaps from 'gulp-sourcemaps'
import suitcss from 'gulp-suitcss'
import nunjucks from 'gulp-nunjucks'
import nunjucksRenderer from 'gulp-nunjucks-render'
import plumber from 'gulp-plumber'
import webpackStream from 'webpack-stream'
import webpack from 'webpack'
import data from 'gulp-data'
import stylelintConfig from '../stylelint.config'
import projectConfig from '../config'

const events = require('../src/data/events.json')
const about = require('../src/data/about.json')
export const EXTRAS_GLOB = 'src/**/*.{txt,json,xml,ico,jpeg,jpg,png,gif,svg,ttf,otf,eot,woff,woff2,mp3,mp4,ogv,ogg,webm}'

gulp.task('clean', () => del('public/'))

gulp.task('webpack', () =>
  webpackStream(require('../webpack.config.js'), webpack)
  .pipe(gulp.dest('public/static/js/')))

gulp.task('css', () =>
  gulp.src('src/static/css/app.css')
    .pipe(sourcemaps.init())
    .pipe(suitcss({
      'postcss-custom-properties': {preserve: true},
      stylelint: stylelintConfig,
      use: ['postcss-nested']
    }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('public/static/css/'))
)

gulp.task('nunjucks', () =>
  gulp.src(['src/templates/**/*.html', '!**/_*'])
    .pipe(plumber())
    .pipe(nunjucks.compile(projectConfig.getProperties(), {
      throwOnUndefined: true,
    }))
    .pipe(plumber.stop())
    .pipe(gulp.dest('public/')))

gulp.task('extras', () =>
  gulp.src(EXTRAS_GLOB)
    .pipe(gulp.dest('public/')))

gulp.task('events', () => {
    events.forEach((event) => {
      gulp.src('src/templates/event.html')
        .pipe(data(event))
        .pipe(nunjucksRenderer({
          path: ['src/templates/'],
          watch: false
        }))
        .pipe(rename('index.html'))
        .pipe(gulp.dest(`public/events/${event.slug}/`))
    })
})
