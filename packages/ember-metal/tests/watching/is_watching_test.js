import {
  computed,
  get,
  defineProperty,
  Mixin,
  observer,
  addObserver,
  removeObserver,
  isWatching
} from '../..';

QUnit.module('isWatching');

function testObserver(assert, setup, teardown, key = 'key') {
  let obj = {};
  function fn() {}

  assert.equal(isWatching(obj, key), false, 'precond - isWatching is false by default');
  setup(obj, key, fn);
  assert.equal(isWatching(obj, key), true, 'isWatching is true when observers are added');
  teardown(obj, key, fn);
  assert.equal(isWatching(obj, key), false, 'isWatching is false after observers are removed');
}

QUnit.test('isWatching is true for regular local observers', function(assert) {
  testObserver(assert, (obj, key, fn) => {
    Mixin.create({
      didChange: observer(key, fn)
    }).apply(obj);
  }, (obj, key, fn) => removeObserver(obj, key, obj, fn));
});

QUnit.test('isWatching is true for nonlocal observers', function(assert) {
  testObserver(assert, (obj, key, fn) => {
    addObserver(obj, key, obj, fn);
  }, (obj, key, fn) => removeObserver(obj, key, obj, fn));
});

QUnit.test('isWatching is true for chained observers', function(assert) {
  testObserver(assert, function(obj, key, fn) {
    addObserver(obj, key + '.bar', obj, fn);
  }, function(obj, key, fn) {
    removeObserver(obj, key + '.bar', obj, fn);
  });
});

QUnit.test('isWatching is true for computed properties', function(assert) {
  testObserver(assert, (obj, key, fn) => {
    defineProperty(obj, 'computed', computed(fn).property(key));
    get(obj, 'computed');
  }, obj => defineProperty(obj, 'computed', null));
});

QUnit.test('isWatching is true for chained computed properties', function(assert) {
  testObserver(assert, (obj, key, fn) => {
    defineProperty(obj, 'computed', computed(fn).property(key + '.bar'));
    get(obj, 'computed');
  }, obj => defineProperty(obj, 'computed', null));
});

// can't watch length on Array - it is special...
// But you should be able to watch a length property of an object
QUnit.test('isWatching is true for \'length\' property on object', function(assert) {
  testObserver(assert, (obj, key, fn) => {
    defineProperty(obj, 'length', null, '26.2 miles');
    addObserver(obj, 'length', obj, fn);
  }, (obj, key, fn) => removeObserver(obj, 'length', obj, fn), 'length');
});
