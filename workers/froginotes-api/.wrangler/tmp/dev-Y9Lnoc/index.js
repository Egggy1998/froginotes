var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};

// .wrangler/tmp/bundle-bJngGf/strip-cf-connecting-ip-header.js
function stripCfConnectingIPHeader(input, init) {
  const request = new Request(input, init);
  request.headers.delete("CF-Connecting-IP");
  return request;
}
var init_strip_cf_connecting_ip_header = __esm({
  ".wrangler/tmp/bundle-bJngGf/strip-cf-connecting-ip-header.js"() {
    "use strict";
    __name(stripCfConnectingIPHeader, "stripCfConnectingIPHeader");
    globalThis.fetch = new Proxy(globalThis.fetch, {
      apply(target, thisArg, argArray) {
        return Reflect.apply(target, thisArg, [
          stripCfConnectingIPHeader.apply(null, argArray)
        ]);
      }
    });
  }
});

// node_modules/unenv/dist/runtime/_internal/utils.mjs
function createNotImplementedError(name) {
  return new Error(`[unenv] ${name} is not implemented yet!`);
}
function notImplemented(name) {
  const fn = /* @__PURE__ */ __name(() => {
    throw createNotImplementedError(name);
  }, "fn");
  return Object.assign(fn, { __unenv__: true });
}
function notImplementedClass(name) {
  return class {
    __unenv__ = true;
    constructor() {
      throw new Error(`[unenv] ${name} is not implemented yet!`);
    }
  };
}
var init_utils = __esm({
  "node_modules/unenv/dist/runtime/_internal/utils.mjs"() {
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    __name(createNotImplementedError, "createNotImplementedError");
    __name(notImplemented, "notImplemented");
    __name(notImplementedClass, "notImplementedClass");
  }
});

// node_modules/unenv/dist/runtime/node/internal/perf_hooks/performance.mjs
var _timeOrigin, _performanceNow, nodeTiming, PerformanceEntry, PerformanceMark, PerformanceMeasure, PerformanceResourceTiming, PerformanceObserverEntryList, Performance, PerformanceObserver, performance;
var init_performance = __esm({
  "node_modules/unenv/dist/runtime/node/internal/perf_hooks/performance.mjs"() {
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_utils();
    _timeOrigin = globalThis.performance?.timeOrigin ?? Date.now();
    _performanceNow = globalThis.performance?.now ? globalThis.performance.now.bind(globalThis.performance) : () => Date.now() - _timeOrigin;
    nodeTiming = {
      name: "node",
      entryType: "node",
      startTime: 0,
      duration: 0,
      nodeStart: 0,
      v8Start: 0,
      bootstrapComplete: 0,
      environment: 0,
      loopStart: 0,
      loopExit: 0,
      idleTime: 0,
      uvMetricsInfo: {
        loopCount: 0,
        events: 0,
        eventsWaiting: 0
      },
      detail: void 0,
      toJSON() {
        return this;
      }
    };
    PerformanceEntry = class {
      __unenv__ = true;
      detail;
      entryType = "event";
      name;
      startTime;
      constructor(name, options) {
        this.name = name;
        this.startTime = options?.startTime || _performanceNow();
        this.detail = options?.detail;
      }
      get duration() {
        return _performanceNow() - this.startTime;
      }
      toJSON() {
        return {
          name: this.name,
          entryType: this.entryType,
          startTime: this.startTime,
          duration: this.duration,
          detail: this.detail
        };
      }
    };
    __name(PerformanceEntry, "PerformanceEntry");
    PerformanceMark = /* @__PURE__ */ __name(class PerformanceMark2 extends PerformanceEntry {
      entryType = "mark";
      constructor() {
        super(...arguments);
      }
      get duration() {
        return 0;
      }
    }, "PerformanceMark");
    PerformanceMeasure = class extends PerformanceEntry {
      entryType = "measure";
    };
    __name(PerformanceMeasure, "PerformanceMeasure");
    PerformanceResourceTiming = class extends PerformanceEntry {
      entryType = "resource";
      serverTiming = [];
      connectEnd = 0;
      connectStart = 0;
      decodedBodySize = 0;
      domainLookupEnd = 0;
      domainLookupStart = 0;
      encodedBodySize = 0;
      fetchStart = 0;
      initiatorType = "";
      name = "";
      nextHopProtocol = "";
      redirectEnd = 0;
      redirectStart = 0;
      requestStart = 0;
      responseEnd = 0;
      responseStart = 0;
      secureConnectionStart = 0;
      startTime = 0;
      transferSize = 0;
      workerStart = 0;
      responseStatus = 0;
    };
    __name(PerformanceResourceTiming, "PerformanceResourceTiming");
    PerformanceObserverEntryList = class {
      __unenv__ = true;
      getEntries() {
        return [];
      }
      getEntriesByName(_name, _type) {
        return [];
      }
      getEntriesByType(type) {
        return [];
      }
    };
    __name(PerformanceObserverEntryList, "PerformanceObserverEntryList");
    Performance = class {
      __unenv__ = true;
      timeOrigin = _timeOrigin;
      eventCounts = /* @__PURE__ */ new Map();
      _entries = [];
      _resourceTimingBufferSize = 0;
      navigation = void 0;
      timing = void 0;
      timerify(_fn, _options) {
        throw createNotImplementedError("Performance.timerify");
      }
      get nodeTiming() {
        return nodeTiming;
      }
      eventLoopUtilization() {
        return {};
      }
      markResourceTiming() {
        return new PerformanceResourceTiming("");
      }
      onresourcetimingbufferfull = null;
      now() {
        if (this.timeOrigin === _timeOrigin) {
          return _performanceNow();
        }
        return Date.now() - this.timeOrigin;
      }
      clearMarks(markName) {
        this._entries = markName ? this._entries.filter((e) => e.name !== markName) : this._entries.filter((e) => e.entryType !== "mark");
      }
      clearMeasures(measureName) {
        this._entries = measureName ? this._entries.filter((e) => e.name !== measureName) : this._entries.filter((e) => e.entryType !== "measure");
      }
      clearResourceTimings() {
        this._entries = this._entries.filter((e) => e.entryType !== "resource" || e.entryType !== "navigation");
      }
      getEntries() {
        return this._entries;
      }
      getEntriesByName(name, type) {
        return this._entries.filter((e) => e.name === name && (!type || e.entryType === type));
      }
      getEntriesByType(type) {
        return this._entries.filter((e) => e.entryType === type);
      }
      mark(name, options) {
        const entry = new PerformanceMark(name, options);
        this._entries.push(entry);
        return entry;
      }
      measure(measureName, startOrMeasureOptions, endMark) {
        let start;
        let end;
        if (typeof startOrMeasureOptions === "string") {
          start = this.getEntriesByName(startOrMeasureOptions, "mark")[0]?.startTime;
          end = this.getEntriesByName(endMark, "mark")[0]?.startTime;
        } else {
          start = Number.parseFloat(startOrMeasureOptions?.start) || this.now();
          end = Number.parseFloat(startOrMeasureOptions?.end) || this.now();
        }
        const entry = new PerformanceMeasure(measureName, {
          startTime: start,
          detail: {
            start,
            end
          }
        });
        this._entries.push(entry);
        return entry;
      }
      setResourceTimingBufferSize(maxSize) {
        this._resourceTimingBufferSize = maxSize;
      }
      addEventListener(type, listener, options) {
        throw createNotImplementedError("Performance.addEventListener");
      }
      removeEventListener(type, listener, options) {
        throw createNotImplementedError("Performance.removeEventListener");
      }
      dispatchEvent(event) {
        throw createNotImplementedError("Performance.dispatchEvent");
      }
      toJSON() {
        return this;
      }
    };
    __name(Performance, "Performance");
    PerformanceObserver = class {
      __unenv__ = true;
      _callback = null;
      constructor(callback) {
        this._callback = callback;
      }
      takeRecords() {
        return [];
      }
      disconnect() {
        throw createNotImplementedError("PerformanceObserver.disconnect");
      }
      observe(options) {
        throw createNotImplementedError("PerformanceObserver.observe");
      }
      bind(fn) {
        return fn;
      }
      runInAsyncScope(fn, thisArg, ...args) {
        return fn.call(thisArg, ...args);
      }
      asyncId() {
        return 0;
      }
      triggerAsyncId() {
        return 0;
      }
      emitDestroy() {
        return this;
      }
    };
    __name(PerformanceObserver, "PerformanceObserver");
    __publicField(PerformanceObserver, "supportedEntryTypes", []);
    performance = globalThis.performance && "addEventListener" in globalThis.performance ? globalThis.performance : new Performance();
  }
});

// node_modules/unenv/dist/runtime/node/perf_hooks.mjs
var init_perf_hooks = __esm({
  "node_modules/unenv/dist/runtime/node/perf_hooks.mjs"() {
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_performance();
  }
});

// node_modules/@cloudflare/unenv-preset/dist/runtime/polyfill/performance.mjs
var init_performance2 = __esm({
  "node_modules/@cloudflare/unenv-preset/dist/runtime/polyfill/performance.mjs"() {
    init_perf_hooks();
    globalThis.performance = performance;
    globalThis.Performance = Performance;
    globalThis.PerformanceEntry = PerformanceEntry;
    globalThis.PerformanceMark = PerformanceMark;
    globalThis.PerformanceMeasure = PerformanceMeasure;
    globalThis.PerformanceObserver = PerformanceObserver;
    globalThis.PerformanceObserverEntryList = PerformanceObserverEntryList;
    globalThis.PerformanceResourceTiming = PerformanceResourceTiming;
  }
});

// node_modules/unenv/dist/runtime/mock/noop.mjs
var noop_default;
var init_noop = __esm({
  "node_modules/unenv/dist/runtime/mock/noop.mjs"() {
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    noop_default = Object.assign(() => {
    }, { __unenv__: true });
  }
});

// node_modules/unenv/dist/runtime/node/console.mjs
import { Writable } from "node:stream";
var _console, _ignoreErrors, _stderr, _stdout, log, info, trace, debug, table, error, warn, createTask, clear, count, countReset, dir, dirxml, group, groupEnd, groupCollapsed, profile, profileEnd, time, timeEnd, timeLog, timeStamp, Console, _times, _stdoutErrorHandler, _stderrErrorHandler;
var init_console = __esm({
  "node_modules/unenv/dist/runtime/node/console.mjs"() {
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_noop();
    init_utils();
    _console = globalThis.console;
    _ignoreErrors = true;
    _stderr = new Writable();
    _stdout = new Writable();
    log = _console?.log ?? noop_default;
    info = _console?.info ?? log;
    trace = _console?.trace ?? info;
    debug = _console?.debug ?? log;
    table = _console?.table ?? log;
    error = _console?.error ?? log;
    warn = _console?.warn ?? error;
    createTask = _console?.createTask ?? /* @__PURE__ */ notImplemented("console.createTask");
    clear = _console?.clear ?? noop_default;
    count = _console?.count ?? noop_default;
    countReset = _console?.countReset ?? noop_default;
    dir = _console?.dir ?? noop_default;
    dirxml = _console?.dirxml ?? noop_default;
    group = _console?.group ?? noop_default;
    groupEnd = _console?.groupEnd ?? noop_default;
    groupCollapsed = _console?.groupCollapsed ?? noop_default;
    profile = _console?.profile ?? noop_default;
    profileEnd = _console?.profileEnd ?? noop_default;
    time = _console?.time ?? noop_default;
    timeEnd = _console?.timeEnd ?? noop_default;
    timeLog = _console?.timeLog ?? noop_default;
    timeStamp = _console?.timeStamp ?? noop_default;
    Console = _console?.Console ?? /* @__PURE__ */ notImplementedClass("console.Console");
    _times = /* @__PURE__ */ new Map();
    _stdoutErrorHandler = noop_default;
    _stderrErrorHandler = noop_default;
  }
});

// node_modules/@cloudflare/unenv-preset/dist/runtime/node/console.mjs
var workerdConsole, assert, clear2, context, count2, countReset2, createTask2, debug2, dir2, dirxml2, error2, group2, groupCollapsed2, groupEnd2, info2, log2, profile2, profileEnd2, table2, time2, timeEnd2, timeLog2, timeStamp2, trace2, warn2, console_default;
var init_console2 = __esm({
  "node_modules/@cloudflare/unenv-preset/dist/runtime/node/console.mjs"() {
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_console();
    workerdConsole = globalThis["console"];
    ({
      assert,
      clear: clear2,
      context: (
        // @ts-expect-error undocumented public API
        context
      ),
      count: count2,
      countReset: countReset2,
      createTask: (
        // @ts-expect-error undocumented public API
        createTask2
      ),
      debug: debug2,
      dir: dir2,
      dirxml: dirxml2,
      error: error2,
      group: group2,
      groupCollapsed: groupCollapsed2,
      groupEnd: groupEnd2,
      info: info2,
      log: log2,
      profile: profile2,
      profileEnd: profileEnd2,
      table: table2,
      time: time2,
      timeEnd: timeEnd2,
      timeLog: timeLog2,
      timeStamp: timeStamp2,
      trace: trace2,
      warn: warn2
    } = workerdConsole);
    Object.assign(workerdConsole, {
      Console,
      _ignoreErrors,
      _stderr,
      _stderrErrorHandler,
      _stdout,
      _stdoutErrorHandler,
      _times
    });
    console_default = workerdConsole;
  }
});

// node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-console
var init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console = __esm({
  "node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-console"() {
    init_console2();
    globalThis.console = console_default;
  }
});

// node_modules/unenv/dist/runtime/node/internal/process/hrtime.mjs
var hrtime;
var init_hrtime = __esm({
  "node_modules/unenv/dist/runtime/node/internal/process/hrtime.mjs"() {
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    hrtime = /* @__PURE__ */ Object.assign(/* @__PURE__ */ __name(function hrtime2(startTime) {
      const now3 = Date.now();
      const seconds = Math.trunc(now3 / 1e3);
      const nanos = now3 % 1e3 * 1e6;
      if (startTime) {
        let diffSeconds = seconds - startTime[0];
        let diffNanos = nanos - startTime[0];
        if (diffNanos < 0) {
          diffSeconds = diffSeconds - 1;
          diffNanos = 1e9 + diffNanos;
        }
        return [diffSeconds, diffNanos];
      }
      return [seconds, nanos];
    }, "hrtime"), { bigint: /* @__PURE__ */ __name(function bigint() {
      return BigInt(Date.now() * 1e6);
    }, "bigint") });
  }
});

// node_modules/unenv/dist/runtime/node/internal/tty/read-stream.mjs
import { Socket } from "node:net";
var ReadStream;
var init_read_stream = __esm({
  "node_modules/unenv/dist/runtime/node/internal/tty/read-stream.mjs"() {
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    ReadStream = class extends Socket {
      fd;
      constructor(fd) {
        super();
        this.fd = fd;
      }
      isRaw = false;
      setRawMode(mode) {
        this.isRaw = mode;
        return this;
      }
      isTTY = false;
    };
    __name(ReadStream, "ReadStream");
  }
});

// node_modules/unenv/dist/runtime/node/internal/tty/write-stream.mjs
import { Socket as Socket2 } from "node:net";
var WriteStream;
var init_write_stream = __esm({
  "node_modules/unenv/dist/runtime/node/internal/tty/write-stream.mjs"() {
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    WriteStream = class extends Socket2 {
      fd;
      constructor(fd) {
        super();
        this.fd = fd;
      }
      clearLine(dir3, callback) {
        callback && callback();
        return false;
      }
      clearScreenDown(callback) {
        callback && callback();
        return false;
      }
      cursorTo(x, y, callback) {
        callback && typeof callback === "function" && callback();
        return false;
      }
      moveCursor(dx, dy, callback) {
        callback && callback();
        return false;
      }
      getColorDepth(env2) {
        return 1;
      }
      hasColors(count3, env2) {
        return false;
      }
      getWindowSize() {
        return [this.columns, this.rows];
      }
      columns = 80;
      rows = 24;
      isTTY = false;
    };
    __name(WriteStream, "WriteStream");
  }
});

// node_modules/unenv/dist/runtime/node/tty.mjs
var init_tty = __esm({
  "node_modules/unenv/dist/runtime/node/tty.mjs"() {
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_read_stream();
    init_write_stream();
  }
});

// node_modules/unenv/dist/runtime/node/internal/process/process.mjs
import { EventEmitter } from "node:events";
var Process;
var init_process = __esm({
  "node_modules/unenv/dist/runtime/node/internal/process/process.mjs"() {
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_tty();
    init_utils();
    Process = class extends EventEmitter {
      env;
      hrtime;
      nextTick;
      constructor(impl) {
        super();
        this.env = impl.env;
        this.hrtime = impl.hrtime;
        this.nextTick = impl.nextTick;
        for (const prop of [...Object.getOwnPropertyNames(Process.prototype), ...Object.getOwnPropertyNames(EventEmitter.prototype)]) {
          const value = this[prop];
          if (typeof value === "function") {
            this[prop] = value.bind(this);
          }
        }
      }
      emitWarning(warning, type, code) {
        console.warn(`${code ? `[${code}] ` : ""}${type ? `${type}: ` : ""}${warning}`);
      }
      emit(...args) {
        return super.emit(...args);
      }
      listeners(eventName) {
        return super.listeners(eventName);
      }
      #stdin;
      #stdout;
      #stderr;
      get stdin() {
        return this.#stdin ??= new ReadStream(0);
      }
      get stdout() {
        return this.#stdout ??= new WriteStream(1);
      }
      get stderr() {
        return this.#stderr ??= new WriteStream(2);
      }
      #cwd = "/";
      chdir(cwd2) {
        this.#cwd = cwd2;
      }
      cwd() {
        return this.#cwd;
      }
      arch = "";
      platform = "";
      argv = [];
      argv0 = "";
      execArgv = [];
      execPath = "";
      title = "";
      pid = 200;
      ppid = 100;
      get version() {
        return "";
      }
      get versions() {
        return {};
      }
      get allowedNodeEnvironmentFlags() {
        return /* @__PURE__ */ new Set();
      }
      get sourceMapsEnabled() {
        return false;
      }
      get debugPort() {
        return 0;
      }
      get throwDeprecation() {
        return false;
      }
      get traceDeprecation() {
        return false;
      }
      get features() {
        return {};
      }
      get release() {
        return {};
      }
      get connected() {
        return false;
      }
      get config() {
        return {};
      }
      get moduleLoadList() {
        return [];
      }
      constrainedMemory() {
        return 0;
      }
      availableMemory() {
        return 0;
      }
      uptime() {
        return 0;
      }
      resourceUsage() {
        return {};
      }
      ref() {
      }
      unref() {
      }
      umask() {
        throw createNotImplementedError("process.umask");
      }
      getBuiltinModule() {
        return void 0;
      }
      getActiveResourcesInfo() {
        throw createNotImplementedError("process.getActiveResourcesInfo");
      }
      exit() {
        throw createNotImplementedError("process.exit");
      }
      reallyExit() {
        throw createNotImplementedError("process.reallyExit");
      }
      kill() {
        throw createNotImplementedError("process.kill");
      }
      abort() {
        throw createNotImplementedError("process.abort");
      }
      dlopen() {
        throw createNotImplementedError("process.dlopen");
      }
      setSourceMapsEnabled() {
        throw createNotImplementedError("process.setSourceMapsEnabled");
      }
      loadEnvFile() {
        throw createNotImplementedError("process.loadEnvFile");
      }
      disconnect() {
        throw createNotImplementedError("process.disconnect");
      }
      cpuUsage() {
        throw createNotImplementedError("process.cpuUsage");
      }
      setUncaughtExceptionCaptureCallback() {
        throw createNotImplementedError("process.setUncaughtExceptionCaptureCallback");
      }
      hasUncaughtExceptionCaptureCallback() {
        throw createNotImplementedError("process.hasUncaughtExceptionCaptureCallback");
      }
      initgroups() {
        throw createNotImplementedError("process.initgroups");
      }
      openStdin() {
        throw createNotImplementedError("process.openStdin");
      }
      assert() {
        throw createNotImplementedError("process.assert");
      }
      binding() {
        throw createNotImplementedError("process.binding");
      }
      permission = { has: /* @__PURE__ */ notImplemented("process.permission.has") };
      report = {
        directory: "",
        filename: "",
        signal: "SIGUSR2",
        compact: false,
        reportOnFatalError: false,
        reportOnSignal: false,
        reportOnUncaughtException: false,
        getReport: /* @__PURE__ */ notImplemented("process.report.getReport"),
        writeReport: /* @__PURE__ */ notImplemented("process.report.writeReport")
      };
      finalization = {
        register: /* @__PURE__ */ notImplemented("process.finalization.register"),
        unregister: /* @__PURE__ */ notImplemented("process.finalization.unregister"),
        registerBeforeExit: /* @__PURE__ */ notImplemented("process.finalization.registerBeforeExit")
      };
      memoryUsage = Object.assign(() => ({
        arrayBuffers: 0,
        rss: 0,
        external: 0,
        heapTotal: 0,
        heapUsed: 0
      }), { rss: () => 0 });
      mainModule = void 0;
      domain = void 0;
      send = void 0;
      exitCode = void 0;
      channel = void 0;
      getegid = void 0;
      geteuid = void 0;
      getgid = void 0;
      getgroups = void 0;
      getuid = void 0;
      setegid = void 0;
      seteuid = void 0;
      setgid = void 0;
      setgroups = void 0;
      setuid = void 0;
      _events = void 0;
      _eventsCount = void 0;
      _exiting = void 0;
      _maxListeners = void 0;
      _debugEnd = void 0;
      _debugProcess = void 0;
      _fatalException = void 0;
      _getActiveHandles = void 0;
      _getActiveRequests = void 0;
      _kill = void 0;
      _preload_modules = void 0;
      _rawDebug = void 0;
      _startProfilerIdleNotifier = void 0;
      _stopProfilerIdleNotifier = void 0;
      _tickCallback = void 0;
      _disconnect = void 0;
      _handleQueue = void 0;
      _pendingMessage = void 0;
      _channel = void 0;
      _send = void 0;
      _linkedBinding = void 0;
    };
    __name(Process, "Process");
  }
});

// node_modules/@cloudflare/unenv-preset/dist/runtime/node/process.mjs
var globalProcess, getBuiltinModule, exit, platform, nextTick, unenvProcess, abort, addListener, allowedNodeEnvironmentFlags, hasUncaughtExceptionCaptureCallback, setUncaughtExceptionCaptureCallback, loadEnvFile, sourceMapsEnabled, arch, argv, argv0, chdir, config, connected, constrainedMemory, availableMemory, cpuUsage, cwd, debugPort, dlopen, disconnect, emit, emitWarning, env, eventNames, execArgv, execPath, finalization, features, getActiveResourcesInfo, getMaxListeners, hrtime3, kill, listeners, listenerCount, memoryUsage, on, off, once, pid, ppid, prependListener, prependOnceListener, rawListeners, release, removeAllListeners, removeListener, report, resourceUsage, setMaxListeners, setSourceMapsEnabled, stderr, stdin, stdout, title, throwDeprecation, traceDeprecation, umask, uptime, version, versions, domain, initgroups, moduleLoadList, reallyExit, openStdin, assert2, binding, send, exitCode, channel, getegid, geteuid, getgid, getgroups, getuid, setegid, seteuid, setgid, setgroups, setuid, permission, mainModule, _events, _eventsCount, _exiting, _maxListeners, _debugEnd, _debugProcess, _fatalException, _getActiveHandles, _getActiveRequests, _kill, _preload_modules, _rawDebug, _startProfilerIdleNotifier, _stopProfilerIdleNotifier, _tickCallback, _disconnect, _handleQueue, _pendingMessage, _channel, _send, _linkedBinding, _process, process_default;
var init_process2 = __esm({
  "node_modules/@cloudflare/unenv-preset/dist/runtime/node/process.mjs"() {
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_hrtime();
    init_process();
    globalProcess = globalThis["process"];
    getBuiltinModule = globalProcess.getBuiltinModule;
    ({ exit, platform, nextTick } = getBuiltinModule(
      "node:process"
    ));
    unenvProcess = new Process({
      env: globalProcess.env,
      hrtime,
      nextTick
    });
    ({
      abort,
      addListener,
      allowedNodeEnvironmentFlags,
      hasUncaughtExceptionCaptureCallback,
      setUncaughtExceptionCaptureCallback,
      loadEnvFile,
      sourceMapsEnabled,
      arch,
      argv,
      argv0,
      chdir,
      config,
      connected,
      constrainedMemory,
      availableMemory,
      cpuUsage,
      cwd,
      debugPort,
      dlopen,
      disconnect,
      emit,
      emitWarning,
      env,
      eventNames,
      execArgv,
      execPath,
      finalization,
      features,
      getActiveResourcesInfo,
      getMaxListeners,
      hrtime: hrtime3,
      kill,
      listeners,
      listenerCount,
      memoryUsage,
      on,
      off,
      once,
      pid,
      ppid,
      prependListener,
      prependOnceListener,
      rawListeners,
      release,
      removeAllListeners,
      removeListener,
      report,
      resourceUsage,
      setMaxListeners,
      setSourceMapsEnabled,
      stderr,
      stdin,
      stdout,
      title,
      throwDeprecation,
      traceDeprecation,
      umask,
      uptime,
      version,
      versions,
      domain,
      initgroups,
      moduleLoadList,
      reallyExit,
      openStdin,
      assert: assert2,
      binding,
      send,
      exitCode,
      channel,
      getegid,
      geteuid,
      getgid,
      getgroups,
      getuid,
      setegid,
      seteuid,
      setgid,
      setgroups,
      setuid,
      permission,
      mainModule,
      _events,
      _eventsCount,
      _exiting,
      _maxListeners,
      _debugEnd,
      _debugProcess,
      _fatalException,
      _getActiveHandles,
      _getActiveRequests,
      _kill,
      _preload_modules,
      _rawDebug,
      _startProfilerIdleNotifier,
      _stopProfilerIdleNotifier,
      _tickCallback,
      _disconnect,
      _handleQueue,
      _pendingMessage,
      _channel,
      _send,
      _linkedBinding
    } = unenvProcess);
    _process = {
      abort,
      addListener,
      allowedNodeEnvironmentFlags,
      hasUncaughtExceptionCaptureCallback,
      setUncaughtExceptionCaptureCallback,
      loadEnvFile,
      sourceMapsEnabled,
      arch,
      argv,
      argv0,
      chdir,
      config,
      connected,
      constrainedMemory,
      availableMemory,
      cpuUsage,
      cwd,
      debugPort,
      dlopen,
      disconnect,
      emit,
      emitWarning,
      env,
      eventNames,
      execArgv,
      execPath,
      exit,
      finalization,
      features,
      getBuiltinModule,
      getActiveResourcesInfo,
      getMaxListeners,
      hrtime: hrtime3,
      kill,
      listeners,
      listenerCount,
      memoryUsage,
      nextTick,
      on,
      off,
      once,
      pid,
      platform,
      ppid,
      prependListener,
      prependOnceListener,
      rawListeners,
      release,
      removeAllListeners,
      removeListener,
      report,
      resourceUsage,
      setMaxListeners,
      setSourceMapsEnabled,
      stderr,
      stdin,
      stdout,
      title,
      throwDeprecation,
      traceDeprecation,
      umask,
      uptime,
      version,
      versions,
      // @ts-expect-error old API
      domain,
      initgroups,
      moduleLoadList,
      reallyExit,
      openStdin,
      assert: assert2,
      binding,
      send,
      exitCode,
      channel,
      getegid,
      geteuid,
      getgid,
      getgroups,
      getuid,
      setegid,
      seteuid,
      setgid,
      setgroups,
      setuid,
      permission,
      mainModule,
      _events,
      _eventsCount,
      _exiting,
      _maxListeners,
      _debugEnd,
      _debugProcess,
      _fatalException,
      _getActiveHandles,
      _getActiveRequests,
      _kill,
      _preload_modules,
      _rawDebug,
      _startProfilerIdleNotifier,
      _stopProfilerIdleNotifier,
      _tickCallback,
      _disconnect,
      _handleQueue,
      _pendingMessage,
      _channel,
      _send,
      _linkedBinding
    };
    process_default = _process;
  }
});

// node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-process
var init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process = __esm({
  "node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-process"() {
    init_process2();
    globalThis.process = process_default;
  }
});

// wrangler-modules-watch:wrangler:modules-watch
var init_wrangler_modules_watch = __esm({
  "wrangler-modules-watch:wrangler:modules-watch"() {
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
  }
});

// node_modules/wrangler/templates/modules-watch-stub.js
var init_modules_watch_stub = __esm({
  "node_modules/wrangler/templates/modules-watch-stub.js"() {
    init_wrangler_modules_watch();
  }
});

// node_modules/unenv/dist/runtime/node/internal/crypto/web.mjs
var subtle;
var init_web = __esm({
  "node_modules/unenv/dist/runtime/node/internal/crypto/web.mjs"() {
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    subtle = globalThis.crypto?.subtle;
  }
});

// node_modules/unenv/dist/runtime/node/internal/crypto/node.mjs
var webcrypto;
var init_node = __esm({
  "node_modules/unenv/dist/runtime/node/internal/crypto/node.mjs"() {
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    webcrypto = new Proxy(globalThis.crypto, { get(_, key) {
      if (key === "CryptoKey") {
        return globalThis.CryptoKey;
      }
      if (typeof globalThis.crypto[key] === "function") {
        return globalThis.crypto[key].bind(globalThis.crypto);
      }
      return globalThis.crypto[key];
    } });
  }
});

// node_modules/unenv/dist/runtime/node/crypto.mjs
var init_crypto = __esm({
  "node_modules/unenv/dist/runtime/node/crypto.mjs"() {
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_web();
    init_node();
  }
});

// node_modules/@cloudflare/unenv-preset/dist/runtime/node/crypto.mjs
var workerdCrypto, Certificate, DiffieHellman, DiffieHellmanGroup, Hash, Hmac, KeyObject, X509Certificate, checkPrime, checkPrimeSync, createDiffieHellman, createDiffieHellmanGroup, createHash, createHmac, createPrivateKey, createPublicKey, createSecretKey, generateKey, generateKeyPair, generateKeyPairSync, generateKeySync, generatePrime, generatePrimeSync, getCiphers, getCurves, getDiffieHellman, getFips, getHashes, hkdf, hkdfSync, pbkdf2, pbkdf2Sync, randomBytes, randomFill, randomFillSync, randomInt, randomUUID, scrypt, scryptSync, secureHeapUsed, setEngine, setFips, subtle2, timingSafeEqual, getRandomValues, webcrypto2, fips;
var init_crypto2 = __esm({
  "node_modules/@cloudflare/unenv-preset/dist/runtime/node/crypto.mjs"() {
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_crypto();
    workerdCrypto = process.getBuiltinModule("node:crypto");
    ({
      Certificate,
      DiffieHellman,
      DiffieHellmanGroup,
      Hash,
      Hmac,
      KeyObject,
      X509Certificate,
      checkPrime,
      checkPrimeSync,
      createDiffieHellman,
      createDiffieHellmanGroup,
      createHash,
      createHmac,
      createPrivateKey,
      createPublicKey,
      createSecretKey,
      generateKey,
      generateKeyPair,
      generateKeyPairSync,
      generateKeySync,
      generatePrime,
      generatePrimeSync,
      getCiphers,
      getCurves,
      getDiffieHellman,
      getFips,
      getHashes,
      hkdf,
      hkdfSync,
      pbkdf2,
      pbkdf2Sync,
      randomBytes,
      randomFill,
      randomFillSync,
      randomInt,
      randomUUID,
      scrypt,
      scryptSync,
      secureHeapUsed,
      setEngine,
      setFips,
      subtle: subtle2,
      timingSafeEqual
    } = workerdCrypto);
    getRandomValues = workerdCrypto.getRandomValues.bind(
      workerdCrypto.webcrypto
    );
    webcrypto2 = {
      // @ts-expect-error unenv has unknown type
      CryptoKey: webcrypto.CryptoKey,
      getRandomValues,
      randomUUID,
      subtle: subtle2
    };
    fips = workerdCrypto.fips;
  }
});

// node_modules/@gpmpay/sdk/dist/index.js
var dist_exports = {};
__export(dist_exports, {
  ALL_API_SCOPES: () => ALL_API_SCOPES,
  API_TOKEN_PREFIX: () => API_TOKEN_PREFIX,
  API_TOKEN_RE: () => API_TOKEN_RE,
  AbortError: () => AbortError,
  DEFAULT_BASE_URL: () => DEFAULT_BASE_URL,
  EVENT_HEADER: () => EVENT_HEADER2,
  GpmPay: () => GpmPay,
  GpmPayAPIError: () => GpmPayAPIError,
  GpmPayAuthenticationError: () => GpmPayAuthenticationError,
  GpmPayBadRequestError: () => GpmPayBadRequestError,
  GpmPayConfigError: () => GpmPayConfigError,
  GpmPayConnectionError: () => GpmPayConnectionError,
  GpmPayError: () => GpmPayError3,
  GpmPayNotFoundError: () => GpmPayNotFoundError,
  GpmPayPermissionError: () => GpmPayPermissionError,
  GpmPayRateLimitError: () => GpmPayRateLimitError,
  GpmPayServerError: () => GpmPayServerError,
  GpmPayTimeoutError: () => GpmPayTimeoutError,
  GpmPayWebhookSignatureError: () => GpmPayWebhookSignatureError2,
  MAX_PAGE_SIZE: () => MAX_PAGE_SIZE,
  SANDBOX_BASE_URL: () => SANDBOX_BASE_URL,
  SIGNATURE_HEADER: () => SIGNATURE_HEADER2,
  WEBHOOK_DELIVERY_TIMEOUT_MS: () => WEBHOOK_DELIVERY_TIMEOUT_MS,
  WEBHOOK_MAX_ATTEMPTS: () => WEBHOOK_MAX_ATTEMPTS,
  WEBHOOK_RETRY_SCHEDULE_SECONDS: () => WEBHOOK_RETRY_SCHEDULE_SECONDS,
  assertWebhookSignature: () => assertWebhookSignature2,
  buildPaymentInstructions: () => buildPaymentInstructions,
  buildVietQrImageUrl: () => buildVietQrImageUrl2,
  buildVietQrPayload: () => buildVietQrPayload,
  constructWebhookEvent: () => constructWebhookEvent2,
  formatVnd: () => formatVnd,
  maskToken: () => maskToken,
  normalizeBaseUrl: () => normalizeBaseUrl,
  signWebhookPayload: () => signWebhookPayload,
  toVnd: () => toVnd,
  tokenPrefix: () => tokenPrefix,
  verifyWebhookSignature: () => verifyWebhookSignature
});
function extractMessage(body) {
  if (typeof body === "string" && body.trim() !== "")
    return body;
  if (body !== null && typeof body === "object") {
    const b = body;
    if (Array.isArray(b.message) || typeof b.message === "string") {
      return b.message;
    }
    if (typeof b.error === "string")
      return b.error;
  }
  return "";
}
function errorFromResponse(status, body, requestId, extra = {}) {
  const raw2 = extractMessage(body);
  const msg = (Array.isArray(raw2) ? raw2.join("; ") : raw2) || `HTTP ${String(status)}`;
  const ctx = {
    status,
    requestId,
    rawBody: body,
    rawMessage: raw2 === "" ? msg : raw2
  };
  switch (status) {
    case 400:
      return new GpmPayBadRequestError(msg, {
        ...ctx,
        validationMessages: Array.isArray(raw2) ? raw2 : [msg]
      });
    case 401: {
      const reason = AUTH_REASONS.find(([re]) => re.test(msg))?.[1] ?? "unknown";
      return new GpmPayAuthenticationError(
        `${msg} \u2014 check your API token is correct, ACTIVE and not expired.`,
        { ...ctx, reason }
      );
    }
    case 403: {
      const scope = /missing scope:\s*(\S+)/i.exec(msg)?.[1];
      if (scope) {
        return new GpmPayPermissionError(
          `API token is missing the "${scope}" scope. Regenerate the token with that scope enabled.`,
          { ...ctx, missingScope: scope, reason: "scope" }
        );
      }
      if (/not available to api tokens/i.test(msg)) {
        return new GpmPayPermissionError(
          `${msg} \u2014 this endpoint is dashboard-only and no API token scope grants it.`,
          { ...ctx, reason: "endpoint" }
        );
      }
      return new GpmPayPermissionError(
        `${msg} \u2014 the resource exists but belongs to another account.`,
        { ...ctx, reason: "ownership" }
      );
    }
    case 404: {
      const resource = /^(.*?)\s+not found/i.exec(msg)?.[1];
      return new GpmPayNotFoundError(
        msg,
        resource === void 0 ? ctx : { ...ctx, resource }
      );
    }
    case 429:
      return new GpmPayRateLimitError(
        msg,
        extra.retryAfterSeconds === void 0 ? ctx : { ...ctx, retryAfterSeconds: extra.retryAfterSeconds }
      );
    default:
      return status >= 500 ? new GpmPayServerError(msg, ctx) : new GpmPayAPIError(msg, ctx);
  }
}
function serializeValue(value) {
  if (value === void 0 || value === null || value === "")
    return null;
  if (value instanceof Date)
    return value.toISOString();
  if (typeof value === "boolean")
    return value ? "true" : "false";
  if (typeof value === "number") {
    return Number.isFinite(value) ? String(value) : null;
  }
  if (typeof value === "string")
    return value;
  return JSON.stringify(value);
}
function buildQuery(params) {
  if (!params)
    return "";
  const search = new URLSearchParams();
  for (const [key, rawValue] of Object.entries(params)) {
    if (rawValue === void 0 || rawValue === null)
      continue;
    if (key === "limit") {
      const limit = Number(rawValue);
      if (!Number.isFinite(limit))
        continue;
      if (limit > MAX_PAGE_SIZE) {
        if (!warnedAboutLimit) {
          warnedAboutLimit = true;
          console.warn(
            `[@gpmpay/sdk] limit=${String(limit)} exceeds the API maximum of ${String(MAX_PAGE_SIZE)}; requesting ${String(MAX_PAGE_SIZE)} instead. Paginate with \`page\`, or use listAll().`
          );
        }
        search.append("limit", String(MAX_PAGE_SIZE));
      } else {
        search.append("limit", String(limit));
      }
      continue;
    }
    if (key === "filters" && typeof rawValue === "object") {
      search.append("filters", JSON.stringify(rawValue));
      continue;
    }
    if (Array.isArray(rawValue)) {
      for (const item of rawValue) {
        const serialized2 = serializeValue(item);
        if (serialized2 !== null)
          search.append(key, serialized2);
      }
      continue;
    }
    const serialized = serializeValue(rawValue);
    if (serialized !== null)
      search.append(key, serialized);
  }
  const qs = search.toString();
  return qs === "" ? "" : `?${qs}`;
}
function toIsoString(value) {
  if (value === void 0 || value === null)
    return void 0;
  return value instanceof Date ? value.toISOString() : value;
}
function isNonProductionBaseUrl(baseUrl) {
  return /localhost|127\.0\.0\.1|sandbox|\.local(?::|\/|$)/i.test(baseUrl);
}
function assertApiToken(raw2, strict = true) {
  if (raw2 === void 0 || raw2 === null) {
    throw new GpmPayConfigError(MSG_MISSING, "missing_api_token");
  }
  if (typeof raw2 !== "string") {
    throw new GpmPayConfigError(
      `apiToken must be a string, received ${typeof raw2}.

${MSG_MISSING}`,
      "invalid_api_token"
    );
  }
  const token = raw2.trim();
  if (token === "") {
    throw new GpmPayConfigError(MSG_MISSING, "missing_api_token");
  }
  if (token.startsWith("Bearer ")) {
    throw new GpmPayConfigError(
      'apiToken must not include the "Bearer " prefix \u2014 pass the raw gpm_\u2026 token; the SDK adds the Authorization header itself.',
      "invalid_api_token"
    );
  }
  if (strict && !API_TOKEN_RE.test(token)) {
    throw new GpmPayConfigError(
      `apiToken has an unexpected format (got "${maskToken(token)}", ${String(token.length)} chars). Expected gpm_XXXXXXXX_\u2026 (${String(API_TOKEN_LENGTH)} chars).
Create a fresh token at ${CREATE_TOKEN_URL}. If you are using a newer token format, pass { strictTokenFormat: false }.`,
      "invalid_api_token_format"
    );
  }
  return token;
}
function tokenPrefix(token) {
  return token.slice(0, PREFIX_LENGTH);
}
function maskToken(token) {
  if (token.length <= PREFIX_LENGTH)
    return "gpm_***";
  return `${token.slice(0, PREFIX_LENGTH)}${"\u2022".repeat(8)}`;
}
function normalizeBaseUrl(input) {
  if (typeof input !== "string") {
    throw new GpmPayConfigError("baseUrl must be a string.", "invalid_base_url");
  }
  let base = input.trim().replace(/\/+$/, "");
  if (base === "") {
    throw new GpmPayConfigError("baseUrl is empty.", "invalid_base_url");
  }
  if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(base)) {
    base = `https://${base}`;
  }
  let parsed;
  try {
    parsed = new URL(base);
  } catch {
    throw new GpmPayConfigError(
      `baseUrl is not a valid URL: ${input}`,
      "invalid_base_url"
    );
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new GpmPayConfigError(
      `baseUrl must use http or https, got "${parsed.protocol}".`,
      "invalid_base_url"
    );
  }
  if (/\/api\/v\d+$/.test(base))
    return base;
  if (/\/api$/.test(base))
    return `${base}/v1`;
  return `${base}/api/v1`;
}
function resolveFetch(injected) {
  if (injected)
    return injected;
  if (typeof globalThis.fetch === "function") {
    return globalThis.fetch.bind(globalThis);
  }
  throw new GpmPayConfigError(
    "global fetch is unavailable. @gpmpay/sdk requires Node 18.17+, or pass a fetch implementation via { fetch }.",
    "invalid_argument"
  );
}
function resolveConfig(options) {
  if (options === void 0 || options === null) {
    return resolveConfig({ apiToken: void 0 });
  }
  const apiToken = assertApiToken(
    options.apiToken,
    options.strictTokenFormat ?? true
  );
  const rawBase = options.baseUrl ?? (options.sandbox === true ? SANDBOX_BASE_URL : DEFAULT_BASE_URL);
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
    throw new GpmPayConfigError(
      `timeoutMs must be a positive number, got ${String(options.timeoutMs)}.`,
      "invalid_argument"
    );
  }
  const maxRetries = options.maxRetries ?? DEFAULT_MAX_RETRIES;
  if (!Number.isInteger(maxRetries) || maxRetries < 0) {
    throw new GpmPayConfigError(
      `maxRetries must be a non-negative integer, got ${String(options.maxRetries)}.`,
      "invalid_argument"
    );
  }
  const defaultHeaders = {};
  for (const [key, value] of Object.entries(options.defaultHeaders ?? {})) {
    if (key.toLowerCase() === "authorization")
      continue;
    defaultHeaders[key] = value;
  }
  return {
    apiToken,
    baseUrl: normalizeBaseUrl(rawBase),
    timeoutMs,
    maxRetries,
    retryBaseDelayMs: options.retryBaseDelayMs ?? DEFAULT_RETRY_BASE_DELAY_MS,
    fetchImpl: resolveFetch(options.fetch),
    userAgent: options.userAgent,
    defaultHeaders,
    onRequest: options.onRequest,
    onResponse: options.onResponse
  };
}
function unwrapEnvelope(body) {
  if (body !== null && typeof body === "object" && !Array.isArray(body) && "statusCode" in body && "data" in body) {
    return body.data;
  }
  return body;
}
function syntheticMeta(count3) {
  return { page: 1, limit: count3, totalItems: count3, totalPages: count3 > 0 ? 1 : 0 };
}
function unwrapList(data) {
  if (Array.isArray(data)) {
    return { data, meta: syntheticMeta(data.length) };
  }
  if (data !== null && typeof data === "object") {
    const obj = data;
    const items = Array.isArray(obj.data) ? obj.data : Array.isArray(obj.items) ? obj.items : null;
    if (items) {
      const meta = obj.meta;
      const fallback = syntheticMeta(items.length);
      return {
        data: items,
        meta: {
          page: meta?.page ?? fallback.page,
          limit: meta?.limit ?? fallback.limit,
          totalItems: meta?.totalItems ?? fallback.totalItems,
          totalPages: meta?.totalPages ?? fallback.totalPages
        }
      };
    }
  }
  return { data: [], meta: { page: 1, limit: 0, totalItems: 0, totalPages: 0 } };
}
function toVnd(amount) {
  if (amount === null || amount === void 0)
    return 0;
  const n = typeof amount === "number" ? amount : Number(amount);
  return Number.isFinite(n) ? n : 0;
}
function formatVnd(amount) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0
  }).format(toVnd(amount));
}
function shouldRetry(params) {
  const { method, status, isConnectionError, attempt, maxRetries } = params;
  if (attempt >= maxRetries)
    return false;
  const idempotent = IDEMPOTENT_METHODS.has(method);
  if (isConnectionError === true)
    return idempotent;
  if (status === void 0)
    return false;
  if (status === 429)
    return true;
  if (!RETRYABLE_STATUSES.has(status))
    return false;
  return idempotent;
}
function parseRetryAfter(headerValue22, now3 = Date.now()) {
  if (headerValue22 === null || headerValue22 === void 0)
    return void 0;
  const trimmed = headerValue22.trim();
  if (trimmed === "")
    return void 0;
  if (/^\d+$/.test(trimmed)) {
    return Number(trimmed);
  }
  const asDate = Date.parse(trimmed);
  if (Number.isNaN(asDate))
    return void 0;
  return Math.max(0, Math.ceil((asDate - now3) / 1e3));
}
function backoffDelayMs(params) {
  const { attempt, baseDelayMs, retryAfterSeconds, random = Math.random } = params;
  if (retryAfterSeconds !== void 0) {
    return Math.max(0, retryAfterSeconds * 1e3);
  }
  const ceiling = Math.min(baseDelayMs * Math.pow(2, attempt), MAX_BACKOFF_MS);
  return Math.floor(random() * ceiling);
}
function linkSignals(external, timeoutMs) {
  const controller = new AbortController();
  let reason = null;
  const onExternal = /* @__PURE__ */ __name(() => {
    if (reason === null)
      reason = "external";
    controller.abort();
  }, "onExternal");
  if (external?.aborted === true) {
    onExternal();
  } else if (external) {
    external.addEventListener("abort", onExternal, { once: true });
  }
  const timer = setTimeout(() => {
    if (reason === null)
      reason = "timeout";
    controller.abort();
  }, timeoutMs);
  timer.unref?.();
  return {
    signal: controller.signal,
    getReason: () => reason,
    dispose: () => {
      clearTimeout(timer);
      external?.removeEventListener("abort", onExternal);
    }
  };
}
function abortableSleep(ms, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted === true) {
      reject(new AbortError());
      return;
    }
    const timer = setTimeout(() => {
      signal?.removeEventListener("abort", onAbort);
      resolve();
    }, ms);
    function onAbort() {
      clearTimeout(timer);
      reject(new AbortError());
    }
    __name(onAbort, "onAbort");
    signal?.addEventListener("abort", onAbort, { once: true });
  });
}
function buildUserAgent(suffix) {
  const base = `@gpmpay/sdk/${VERSION} (node/${process.version}; ${process.platform})`;
  return suffix === void 0 || suffix === "" ? base : `${base} ${suffix}`;
}
function syscallCodeOf(error3) {
  const cause = error3?.cause;
  const code = cause?.code;
  return typeof code === "string" ? code : void 0;
}
async function parseBody2(response) {
  if (response.status === 204 || response.status === 205)
    return void 0;
  if (response.headers.get("content-length") === "0")
    return void 0;
  const contentType = response.headers.get("content-type") ?? "";
  const text = await response.text();
  if (text === "")
    return void 0;
  if (contentType.includes("json")) {
    return JSON.parse(text);
  }
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}
function toBuffer2(input) {
  if (Buffer.isBuffer(input))
    return input;
  if (typeof input === "string")
    return Buffer.from(input, "utf8");
  return Buffer.from(input);
}
function parseSignatureHeader2(signature) {
  const parts = {};
  for (const segment of signature.split(",")) {
    const index = segment.indexOf("=");
    if (index > 0) {
      parts[segment.slice(0, index).trim()] = segment.slice(index + 1).trim();
    }
  }
  return parts;
}
function assertWebhookSignature2(input) {
  const { signature, secret, now: now3 = Date.now } = input;
  const tolerance = input.toleranceSeconds ?? DEFAULT_TOLERANCE_SECONDS2;
  if (typeof secret !== "string" || secret === "") {
    throw new GpmPayWebhookSignatureError2(
      "Webhook secret is empty. Pass the secret you configured on the webhook setting (e.g. process.env.GPMPAY_WEBHOOK_SECRET).",
      "missing_secret"
    );
  }
  if (typeof signature !== "string" || signature.trim() === "") {
    throw new GpmPayWebhookSignatureError2(
      `Missing ${SIGNATURE_HEADER2} header.`,
      "malformed_header"
    );
  }
  const parts = parseSignatureHeader2(signature);
  const timestamp = Number(parts.t);
  const v1 = parts.v1;
  if (!Number.isFinite(timestamp) || timestamp <= 0 || !v1) {
    throw new GpmPayWebhookSignatureError2(
      `Malformed ${SIGNATURE_HEADER2}: "${signature}". Expected "t=<unix_seconds>,v1=<hex>".`,
      "malformed_header"
    );
  }
  if (tolerance > 0 && Math.abs(now3() / 1e3 - timestamp) > tolerance) {
    throw new GpmPayWebhookSignatureError2(
      `Webhook timestamp is outside the ${String(tolerance)}s tolerance (t=${String(timestamp)}). Check for clock skew between your server and GPM Pay.`,
      "timestamp_skew"
    );
  }
  const raw2 = toBuffer2(input.rawBody);
  const expected = createHmac("sha256", secret).update(Buffer.concat([Buffer.from(`${String(timestamp)}.`, "utf8"), raw2])).digest();
  const provided = Buffer.from(v1, "hex");
  if (expected.length !== provided.length || !timingSafeEqual(expected, provided)) {
    throw new GpmPayWebhookSignatureError2(
      "Webhook signature mismatch \u2014 wrong secret, or the body was modified in transit. Make sure you are verifying the raw request body, not a re-serialized object.",
      "mismatch"
    );
  }
  return { timestamp };
}
function verifyWebhookSignature(input) {
  try {
    assertWebhookSignature2(input);
    return true;
  } catch {
    return false;
  }
}
function signWebhookPayload(params) {
  const timestamp = params.timestamp ?? Math.floor(Date.now() / 1e3);
  const raw2 = toBuffer2(params.rawBody);
  const digest = createHmac("sha256", params.secret).update(Buffer.concat([Buffer.from(`${String(timestamp)}.`, "utf8"), raw2])).digest("hex");
  return `t=${String(timestamp)},v1=${digest}`;
}
function headerValue2(headers, name) {
  if (!headers)
    return void 0;
  const target = name.toLowerCase();
  for (const [key, value] of Object.entries(headers)) {
    if (key.toLowerCase() !== target)
      continue;
    return Array.isArray(value) ? value[0] : value;
  }
  return void 0;
}
function constructWebhookEvent2(input) {
  const { timestamp } = assertWebhookSignature2(input);
  const rawBody = toBuffer2(input.rawBody).toString("utf8");
  return {
    type: headerValue2(input.headers, EVENT_HEADER2) ?? "transaction.created",
    timestamp,
    payload: JSON.parse(rawBody),
    rawBody
  };
}
function crc16ccitt(input) {
  let crc = 65535;
  for (let i = 0; i < input.length; i++) {
    crc ^= input.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = crc & 32768 ? crc << 1 ^ 4129 : crc << 1;
      crc &= 65535;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}
function isDynamic2(amount) {
  return amount !== void 0 && amount !== null && amount !== "";
}
function trimDescription2(description) {
  return description === void 0 ? void 0 : description.slice(0, DESCRIPTION_MAX_LENGTH2);
}
function buildVietQrPayload(input) {
  const {
    bankBin,
    accountNumber,
    amount,
    description,
    serviceCode = "QRIBFTTA"
  } = input;
  const beneficiaryOrg = tlv("00", bankBin) + tlv("01", accountNumber);
  const merchantAccountInfo = tlv("00", "A000000727") + tlv("01", beneficiaryOrg) + tlv("02", serviceCode);
  const dynamic = isDynamic2(amount);
  const trimmedDesc = trimDescription2(description);
  const additionalData = trimmedDesc ? tlv("08", trimmedDesc) : "";
  const parts = [
    tlv("00", "01"),
    tlv("01", dynamic ? "12" : "11"),
    tlv("38", merchantAccountInfo),
    tlv("53", "704"),
    ...dynamic ? [tlv("54", String(amount))] : [],
    tlv("58", "VN"),
    ...additionalData ? [tlv("62", additionalData)] : []
  ];
  const base = parts.join("") + "6304";
  return base + crc16ccitt(base);
}
function buildVietQrImageUrl2(input) {
  const { bankBin, accountNumber, amount, template = "compact" } = input;
  const trimmedDesc = trimDescription2(input.description);
  const url = new URL(
    `https://img.vietqr.io/image/${bankBin}-${accountNumber}-${template}.png`
  );
  if (isDynamic2(amount))
    url.searchParams.set("amount", String(amount));
  if (trimmedDesc)
    url.searchParams.set("addInfo", trimmedDesc);
  if (input.accountName !== void 0) {
    url.searchParams.set("accountName", input.accountName);
  }
  return url.toString();
}
function buildPaymentInstructions(request) {
  const account = request.bankAccount;
  const bank = account.bank;
  if (bank === void 0 || bank.bin === "") {
    throw new GpmPayConfigError(
      "buildPaymentInstructions: bankAccount.bank.bin is required to build a VietQR payload. Fetch the account with its `bank` relation, e.g. `await client.bankAccounts.retrieve(id)`."
    );
  }
  const bankBin = bank.bin;
  const base = {
    bankBin,
    accountNumber: account.accountNumber,
    amount: request.amount,
    description: request.transferContent
  };
  if (request.serviceCode !== void 0)
    base.serviceCode = request.serviceCode;
  const imageInput = {
    ...base,
    accountName: account.ownerName
  };
  if (request.template !== void 0)
    imageInput.template = request.template;
  return {
    qrPayload: buildVietQrPayload(base),
    qrImageUrl: buildVietQrImageUrl2(imageInput),
    amount: Number(request.amount),
    transferContent: request.transferContent,
    bankName: bank.shortName === "" ? bank.name : bank.shortName,
    bankBin,
    accountNumber: account.accountNumber,
    accountName: account.ownerName
  };
}
var ApiTokensResource, BankAccountsResource, BanksResource, BRAND3, GpmPayError3, GpmPayConfigError, GpmPayConnectionError, GpmPayTimeoutError, GpmPayWebhookSignatureError2, GpmPayAPIError, GpmPayBadRequestError, GpmPayAuthenticationError, GpmPayPermissionError, GpmPayNotFoundError, GpmPayRateLimitError, GpmPayServerError, AUTH_REASONS, MAX_PAGE_SIZE, warnedAboutLimit, SimulatorResource, TransactionsResource, WebhookHistoriesResource, WebhookSettingsResource, API_TOKEN_PREFIX, API_TOKEN_RE, API_TOKEN_LENGTH, PREFIX_LENGTH, CREATE_TOKEN_URL, MSG_MISSING, DEFAULT_BASE_URL, SANDBOX_BASE_URL, DEFAULT_TIMEOUT_MS, DEFAULT_MAX_RETRIES, DEFAULT_RETRY_BASE_DELAY_MS, VERSION, RETRYABLE_STATUSES, IDEMPOTENT_METHODS, MAX_BACKOFF_MS, AbortError, REQUEST_ID_HEADER, HttpClient, SCOPE_PROBES, GpmPay, SIGNATURE_HEADER2, EVENT_HEADER2, DEFAULT_TOLERANCE_SECONDS2, DESCRIPTION_MAX_LENGTH2, tlv, ALL_API_SCOPES, WEBHOOK_RETRY_SCHEDULE_SECONDS, WEBHOOK_MAX_ATTEMPTS, WEBHOOK_DELIVERY_TIMEOUT_MS;
var init_dist = __esm({
  "node_modules/@gpmpay/sdk/dist/index.js"() {
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_crypto2();
    ApiTokensResource = /* @__PURE__ */ __name(class {
      constructor(http) {
        this.http = http;
      }
      http;
      /**
       * Permanently delete a token. Any valid token may call this; the backend
       * still requires the token being deleted to belong to the caller.
       */
      remove(id, options = {}) {
        return this.http.request(
          "DELETE",
          `/api-tokens/${encodeURIComponent(id)}`,
          options
        );
      }
    }, "ApiTokensResource");
    BankAccountsResource = /* @__PURE__ */ __name(class {
      constructor(http) {
        this.http = http;
      }
      http;
      list(params = {}, options = {}) {
        return this.http.requestList("GET", "/bank-accounts", {
          ...options,
          query: params
        });
      }
      retrieve(id, options = {}) {
        return this.http.request(
          "GET",
          `/bank-accounts/${encodeURIComponent(id)}`,
          options
        );
      }
    }, "BankAccountsResource");
    BanksResource = /* @__PURE__ */ __name(class {
      constructor(http) {
        this.http = http;
      }
      http;
      /** List active banks. The endpoint returns a flat array, not a page. */
      async list(options = {}) {
        const page = await this.http.requestList("GET", "/banks", options);
        return page.data;
      }
    }, "BanksResource");
    BRAND3 = /* @__PURE__ */ Symbol.for("gpmpay.sdk.error");
    GpmPayError3 = /* @__PURE__ */ __name(class extends Error {
      code;
      /** @internal Cross-realm brand — `instanceof` breaks across CJS/ESM copies. */
      [BRAND3] = true;
      constructor(message, code) {
        super(message);
        this.name = new.target.name;
        this.code = code;
        Object.setPrototypeOf(this, new.target.prototype);
      }
      /**
       * Prefer this over `instanceof` when a dual CJS/ESM install could put two
       * copies of the class in one process.
       */
      static isGpmPayError(value) {
        return typeof value === "object" && value !== null && value[BRAND3] === true;
      }
    }, "GpmPayError");
    GpmPayConfigError = /* @__PURE__ */ __name(class extends GpmPayError3 {
      constructor(message, code = "invalid_argument") {
        super(message, code);
      }
    }, "GpmPayConfigError");
    GpmPayConnectionError = /* @__PURE__ */ __name(class extends GpmPayError3 {
      /** Overrides the standard `Error.cause` so it is always populated here. */
      cause;
      /** Node's `err.cause.code`, e.g. `ECONNREFUSED`, `ENOTFOUND`. */
      syscallCode;
      constructor(message, cause, syscallCode) {
        super(message, "connection_error");
        this.cause = cause;
        this.syscallCode = syscallCode;
      }
    }, "GpmPayConnectionError");
    GpmPayTimeoutError = /* @__PURE__ */ __name(class extends GpmPayError3 {
      timeoutMs;
      constructor(message, timeoutMs) {
        super(message, "timeout");
        this.timeoutMs = timeoutMs;
      }
    }, "GpmPayTimeoutError");
    GpmPayWebhookSignatureError2 = /* @__PURE__ */ __name(class extends GpmPayError3 {
      reason;
      constructor(message, reason) {
        super(message, "webhook_signature");
        this.reason = reason;
      }
    }, "GpmPayWebhookSignatureError");
    GpmPayAPIError = /* @__PURE__ */ __name(class extends GpmPayError3 {
      status;
      /** Correlation id sent as `X-GPMPay-Request-Id`. Quote it to support. */
      requestId;
      rawBody;
      rawMessage;
      constructor(message, ctx, code = "api_error") {
        super(message, code);
        this.status = ctx.status;
        this.requestId = ctx.requestId;
        this.rawBody = ctx.rawBody;
        this.rawMessage = ctx.rawMessage;
      }
    }, "GpmPayAPIError");
    GpmPayBadRequestError = /* @__PURE__ */ __name(class extends GpmPayAPIError {
      /** One entry per failed constraint, as produced by Nest's ValidationPipe. */
      validationMessages;
      constructor(message, ctx) {
        super(message, ctx, "bad_request");
        this.validationMessages = ctx.validationMessages;
      }
    }, "GpmPayBadRequestError");
    GpmPayAuthenticationError = /* @__PURE__ */ __name(class extends GpmPayAPIError {
      reason;
      constructor(message, ctx) {
        super(message, ctx, "authentication_error");
        this.reason = ctx.reason;
      }
    }, "GpmPayAuthenticationError");
    GpmPayPermissionError = /* @__PURE__ */ __name(class extends GpmPayAPIError {
      missingScope;
      reason;
      constructor(message, ctx) {
        super(message, ctx, "permission_error");
        this.missingScope = ctx.missingScope;
        this.reason = ctx.reason;
      }
    }, "GpmPayPermissionError");
    GpmPayNotFoundError = /* @__PURE__ */ __name(class extends GpmPayAPIError {
      /** Resource name parsed out of e.g. `"Order not found"`. */
      resource;
      constructor(message, ctx) {
        super(message, ctx, "not_found");
        this.resource = ctx.resource;
      }
    }, "GpmPayNotFoundError");
    GpmPayRateLimitError = /* @__PURE__ */ __name(class extends GpmPayAPIError {
      retryAfterSeconds;
      constructor(message, ctx) {
        super(message, ctx, "rate_limit");
        this.retryAfterSeconds = ctx.retryAfterSeconds;
      }
    }, "GpmPayRateLimitError");
    GpmPayServerError = /* @__PURE__ */ __name(class extends GpmPayAPIError {
      constructor(message, ctx) {
        super(message, ctx, "server_error");
      }
    }, "GpmPayServerError");
    AUTH_REASONS = [
      [/missing bearer token/i, "missing_bearer"],
      [/invalid token format/i, "invalid_format"],
      [/token is not active/i, "token_inactive"],
      [/token[_ ]expired/i, "token_expired"],
      [/user inactive/i, "user_inactive"],
      [/invalid token/i, "invalid_token"]
    ];
    __name(extractMessage, "extractMessage");
    __name(errorFromResponse, "errorFromResponse");
    MAX_PAGE_SIZE = 50;
    warnedAboutLimit = false;
    __name(serializeValue, "serializeValue");
    __name(buildQuery, "buildQuery");
    __name(toIsoString, "toIsoString");
    __name(isNonProductionBaseUrl, "isNonProductionBaseUrl");
    SimulatorResource = /* @__PURE__ */ __name(class {
      constructor(http) {
        this.http = http;
      }
      http;
      assertSafeEnvironment(options) {
        if (options.allowOnProduction === true)
          return;
        if (isNonProductionBaseUrl(this.http.baseUrl))
          return;
        throw new GpmPayConfigError(
          `simulator: refusing to create a simulated transaction against ${this.http.baseUrl}. Point the client at localhost or the sandbox (\`new GpmPay({ sandbox: true })\`), or pass { allowOnProduction: true } if you really mean it.`
        );
      }
      /**
       * Create a simulated bank transaction.
       *
       * Returns the envelope the route actually sends — `{ transaction,
       * historyIds }`, not a bare `Transaction`. Read `result.transaction` for the
       * ledger row and `result.historyIds.length` to confirm a webhook was queued.
       *
       * `async` so guard failures reject rather than throwing synchronously.
       */
      async createTransaction(params, options = {}) {
        this.assertSafeEnvironment(options);
        if (!Number.isInteger(params.amount) || params.amount < 1) {
          throw new GpmPayConfigError(
            `simulator: amount must be an integer number of VND >= 1, received ${String(params.amount)}.`
          );
        }
        const body = {
          bankAccountId: params.bankAccountId,
          amount: params.amount,
          transferContent: params.transferContent
        };
        if (params.type !== void 0)
          body.type = params.type;
        if (params.referenceCode !== void 0) {
          body.referenceCode = params.referenceCode;
        }
        if (params.counterAccount !== void 0) {
          body.counterAccount = params.counterAccount;
        }
        if (params.counterName !== void 0)
          body.counterName = params.counterName;
        const transactionTime = toIsoString(params.transactionTime);
        if (transactionTime !== void 0)
          body.transactionTime = transactionTime;
        const { allowOnProduction: _ignored, ...requestOptions } = options;
        return await this.http.request(
          "POST",
          "/simulator/transactions",
          { ...requestOptions, body }
        );
      }
    }, "SimulatorResource");
    TransactionsResource = /* @__PURE__ */ __name(class {
      constructor(http) {
        this.http = http;
      }
      http;
      /**
       * List transactions across your bank accounts. Scope: `transactions:read`.
       *
       * @remarks
       * `limit` is capped at 50 server-side. `search` matches `referenceCode` and
       * `transferContent`; `startDate`/`endDate` filter on `transactionTime`.
       */
      list(params = {}, options = {}) {
        return this.http.requestList("GET", "/transactions", {
          ...options,
          query: params
        });
      }
      /**
       * Iterate every matching transaction, fetching pages as needed.
       *
       * @example
       * for await (const txn of client.transactions.listAll({ type: 'IN' })) {
       *   console.log(txn.referenceCode);
       * }
       */
      async *listAll(params = {}, options = {}) {
        let page = 1;
        for (; ; ) {
          const result = await this.list({ ...params, page }, options);
          for (const txn of result.data)
            yield txn;
          if (result.data.length === 0)
            return;
          if (page >= result.meta.totalPages)
            return;
          page++;
        }
      }
      /** Fetch one transaction. Scope: `transactions:read`. */
      retrieve(id, options = {}) {
        return this.http.request(
          "GET",
          `/transactions/${encodeURIComponent(id)}`,
          options
        );
      }
    }, "TransactionsResource");
    WebhookHistoriesResource = /* @__PURE__ */ __name(class {
      constructor(http) {
        this.http = http;
      }
      http;
      list(params = {}, options = {}) {
        return this.http.requestList("GET", "/webhook-histories", {
          ...options,
          query: params
        });
      }
      retrieve(id, options = {}) {
        return this.http.request(
          "GET",
          `/webhook-histories/${encodeURIComponent(id)}`,
          options
        );
      }
      /** Re-enqueue a failed delivery. */
      retry(id, options = {}) {
        return this.http.request(
          "POST",
          `/webhook-histories/${encodeURIComponent(id)}/retry`,
          options
        );
      }
    }, "WebhookHistoriesResource");
    WebhookSettingsResource = /* @__PURE__ */ __name(class {
      constructor(http) {
        this.http = http;
      }
      http;
      list(params = {}, options = {}) {
        return this.http.requestList("GET", "/webhook-settings", {
          ...options,
          query: params
        });
      }
      retrieve(id, options = {}) {
        return this.http.request(
          "GET",
          `/webhook-settings/${encodeURIComponent(id)}`,
          options
        );
      }
      create(params, options = {}) {
        return this.http.request("POST", "/webhook-settings", {
          ...options,
          body: params
        });
      }
      update(id, params, options = {}) {
        return this.http.request(
          "PATCH",
          `/webhook-settings/${encodeURIComponent(id)}`,
          { ...options, body: params }
        );
      }
      remove(id, options = {}) {
        return this.http.request(
          "DELETE",
          `/webhook-settings/${encodeURIComponent(id)}`,
          options
        );
      }
      /**
       * Register an HTTP endpoint with HMAC signing and hand back the secret.
       *
       * Pair the returned secret with `verifyWebhookSignature` from
       * `@gpmpay/sdk/webhooks`.
       */
      async createHmacEndpoint(params, options = {}) {
        const secret = params.secret ?? randomBytes(32).toString("hex");
        const base = {
          driver: "HTTP",
          url: params.url,
          authorizationType: "HMAC",
          authorizationSecret: secret,
          ...params.name === void 0 ? {} : { name: params.name }
        };
        const body = params.scope === "SPECIFIC" ? {
          ...base,
          scope: "SPECIFIC",
          bankAccountIds: params.bankAccountIds ?? []
        } : { ...base, scope: "ALL" };
        const setting = await this.create(body, options);
        return { setting, secret };
      }
    }, "WebhookSettingsResource");
    API_TOKEN_PREFIX = "gpm_";
    API_TOKEN_RE = /^gpm_[A-Za-z0-9_-]{8}_[A-Za-z0-9_-]{24}$/;
    API_TOKEN_LENGTH = 37;
    PREFIX_LENGTH = 12;
    CREATE_TOKEN_URL = "https://app.gpmpay.com/api-tokens";
    MSG_MISSING = `apiToken is required \u2014 the GPM Pay SDK cannot be used without one.
  1. Create a token at ${CREATE_TOKEN_URL}
  2. Pass it explicitly:  new GpmPay({ apiToken: "gpm_..." })
     or set the GPMPAY_API_TOKEN environment variable and use GpmPay.fromEnv().`;
    __name(assertApiToken, "assertApiToken");
    __name(tokenPrefix, "tokenPrefix");
    __name(maskToken, "maskToken");
    DEFAULT_BASE_URL = "https://api.gpmpay.com";
    SANDBOX_BASE_URL = "https://sandbox-api.gpmpay.com";
    DEFAULT_TIMEOUT_MS = 3e4;
    DEFAULT_MAX_RETRIES = 2;
    DEFAULT_RETRY_BASE_DELAY_MS = 500;
    __name(normalizeBaseUrl, "normalizeBaseUrl");
    __name(resolveFetch, "resolveFetch");
    __name(resolveConfig, "resolveConfig");
    VERSION = "0.4.0";
    __name(unwrapEnvelope, "unwrapEnvelope");
    __name(syntheticMeta, "syntheticMeta");
    __name(unwrapList, "unwrapList");
    __name(toVnd, "toVnd");
    __name(formatVnd, "formatVnd");
    RETRYABLE_STATUSES = /* @__PURE__ */ new Set([408, 425, 429, 500, 502, 503, 504]);
    IDEMPOTENT_METHODS = /* @__PURE__ */ new Set(["GET", "HEAD", "DELETE"]);
    MAX_BACKOFF_MS = 8e3;
    __name(shouldRetry, "shouldRetry");
    __name(parseRetryAfter, "parseRetryAfter");
    __name(backoffDelayMs, "backoffDelayMs");
    __name(linkSignals, "linkSignals");
    AbortError = /* @__PURE__ */ __name(class extends Error {
      name = "AbortError";
      constructor(message = "The operation was aborted.") {
        super(message);
      }
    }, "AbortError");
    __name(abortableSleep, "abortableSleep");
    REQUEST_ID_HEADER = "X-GPMPay-Request-Id";
    __name(buildUserAgent, "buildUserAgent");
    __name(syscallCodeOf, "syscallCodeOf");
    HttpClient = /* @__PURE__ */ __name(class {
      config;
      userAgent;
      constructor(config2) {
        this.config = config2;
        this.userAgent = buildUserAgent(config2.userAgent);
      }
      get baseUrl() {
        return this.config.baseUrl;
      }
      /** Issue a request and return the unwrapped `data` payload. */
      async request(method, path, options = {}) {
        const raw2 = await this.send(method, path, options);
        return unwrapEnvelope(raw2);
      }
      /** Issue a list request and normalize it into a `Page<T>`. */
      async requestList(method, path, options = {}) {
        const raw2 = await this.send(method, path, options);
        return unwrapList(unwrapEnvelope(raw2));
      }
      async send(method, path, options) {
        const url = `${this.config.baseUrl}${path}${buildQuery(options.query)}`;
        const requestId = randomUUID();
        const timeoutMs = options.timeoutMs ?? this.config.timeoutMs;
        const hasBody = options.body !== void 0;
        const headers = {
          ...this.config.defaultHeaders,
          Accept: "application/json",
          "User-Agent": this.userAgent,
          [REQUEST_ID_HEADER]: requestId,
          ...options.headers,
          // Applied last: Authorization is not user-overridable.
          Authorization: `Bearer ${this.config.apiToken}`
        };
        if (hasBody)
          headers["Content-Type"] = "application/json";
        const init = { method, headers };
        if (hasBody)
          init.body = JSON.stringify(options.body);
        for (let attempt = 0; ; attempt++) {
          const link = linkSignals(options.signal, timeoutMs);
          const startedAt = Date.now();
          this.config.onRequest?.({ method, url, requestId, attempt });
          let response;
          try {
            response = await this.config.fetchImpl(url, {
              ...init,
              signal: link.signal
            });
          } catch (error3) {
            link.dispose();
            if (link.getReason() === "timeout") {
              if (shouldRetry({
                method,
                isConnectionError: true,
                attempt,
                maxRetries: this.config.maxRetries
              })) {
                await this.waitBeforeRetry(attempt, void 0, options.signal);
                continue;
              }
              throw new GpmPayTimeoutError(
                `Request timed out after ${String(timeoutMs)}ms: ${method} ${path}`,
                timeoutMs
              );
            }
            if (link.getReason() === "external") {
              throw new AbortError(`Request aborted by caller: ${method} ${path}`);
            }
            if (shouldRetry({
              method,
              isConnectionError: true,
              attempt,
              maxRetries: this.config.maxRetries
            })) {
              await this.waitBeforeRetry(attempt, void 0, options.signal);
              continue;
            }
            const syscall = syscallCodeOf(error3);
            throw new GpmPayConnectionError(
              `Could not reach the GPM Pay API at ${this.config.baseUrl}` + (syscall === void 0 ? "" : ` (${syscall})`) + ". Check the baseUrl and your network connection.",
              error3,
              syscall
            );
          }
          link.dispose();
          this.config.onResponse?.({
            requestId,
            status: response.status,
            durationMs: Date.now() - startedAt,
            attempt
          });
          if (response.ok) {
            return await parseBody2(response);
          }
          const retryAfterSeconds = parseRetryAfter(
            response.headers.get("retry-after")
          );
          if (shouldRetry({
            method,
            status: response.status,
            attempt,
            maxRetries: this.config.maxRetries
          })) {
            await this.waitBeforeRetry(attempt, retryAfterSeconds, options.signal);
            continue;
          }
          const errorBody = await parseBody2(response).catch(() => void 0);
          throw errorFromResponse(
            response.status,
            errorBody,
            requestId,
            retryAfterSeconds === void 0 ? {} : { retryAfterSeconds }
          );
        }
      }
      async waitBeforeRetry(attempt, retryAfterSeconds, signal) {
        const delay = backoffDelayMs({
          attempt,
          baseDelayMs: this.config.retryBaseDelayMs,
          retryAfterSeconds
        });
        if (delay > 0)
          await abortableSleep(delay, signal);
      }
    }, "HttpClient");
    __name(parseBody2, "parseBody");
    SCOPE_PROBES = [
      { scope: "transactions:read", path: "/transactions" },
      { scope: "bank-accounts:read", path: "/bank-accounts" },
      { scope: "webhooks:manage", path: "/webhook-settings" }
    ];
    GpmPay = /* @__PURE__ */ __name(class _GpmPay {
      transactions;
      bankAccounts;
      banks;
      webhookSettings;
      webhookHistories;
      apiTokens;
      simulator;
      http;
      token;
      /** @throws {GpmPayConfigError} when `apiToken` is missing or malformed. */
      constructor(options) {
        const config2 = resolveConfig(options);
        this.token = config2.apiToken;
        this.http = new HttpClient(config2);
        this.transactions = new TransactionsResource(this.http);
        this.bankAccounts = new BankAccountsResource(this.http);
        this.banks = new BanksResource(this.http);
        this.webhookSettings = new WebhookSettingsResource(this.http);
        this.webhookHistories = new WebhookHistoriesResource(this.http);
        this.apiTokens = new ApiTokensResource(this.http);
        this.simulator = new SimulatorResource(this.http);
      }
      /**
       * Build a client from `GPMPAY_API_TOKEN` and `GPMPAY_API_URL`.
       *
       * @throws {GpmPayConfigError} when `GPMPAY_API_TOKEN` is not set.
       */
      static fromEnv(overrides = {}) {
        const envToken = process.env.GPMPAY_API_TOKEN;
        const envUrl = process.env.GPMPAY_API_URL;
        const options = {
          ...overrides,
          apiToken: overrides.apiToken ?? envToken
        };
        const baseUrl = overrides.baseUrl ?? envUrl;
        if (baseUrl !== void 0)
          options.baseUrl = baseUrl;
        return new _GpmPay(options);
      }
      /** Fully normalized API base, e.g. `https://api.gpmpay.com/api/v1`. */
      get baseUrl() {
        return this.http.baseUrl;
      }
      /** First 12 chars of the token. Safe to log and quote in support tickets. */
      get tokenPrefix() {
        return tokenPrefix(this.token);
      }
      toString() {
        return `GpmPay(${this.baseUrl}, ${maskToken(this.token)})`;
      }
      /** Ensures `console.log(client)` can never dump the token. */
      [/* @__PURE__ */ Symbol.for("nodejs.util.inspect.custom")]() {
        return this.toString();
      }
      /**
       * Verify connectivity and authentication, and report the token's real scopes.
       *
       * Issues one minimal read per scope in parallel and infers the grant from the
       * outcome. The token's own record cannot be used for this: `GET /api-tokens`
       * declares no `@ApiScopes()`, so the fail-closed guard rejects every API
       * token that asks for it.
       *
       * A 401 from the first probe to complete propagates — an invalid token is a
       * hard failure, not "no scopes".
       */
      async ping(options = {}) {
        const startedAt = Date.now();
        const results = await Promise.all(
          SCOPE_PROBES.map(async ({ scope, path }) => {
            try {
              await this.http.requestList("GET", path, {
                ...options,
                query: { limit: 1 }
              });
              return { scope, granted: true };
            } catch (error3) {
              if (error3 instanceof GpmPayPermissionError) {
                return { scope, granted: false };
              }
              throw error3;
            }
          })
        );
        const latencyMs = Date.now() - startedAt;
        return {
          ok: true,
          baseUrl: this.baseUrl,
          tokenPrefix: this.tokenPrefix,
          latencyMs,
          scopes: {
            granted: results.filter((r) => r.granted).map((r) => r.scope),
            denied: results.filter((r) => !r.granted).map((r) => r.scope)
          }
        };
      }
      /**
       * Escape hatch for endpoints this SDK does not model yet.
       *
       * @example
       * await client.request('GET', '/some/new/endpoint');
       */
      request(method, path, options = {}) {
        return this.http.request(method, path, options);
      }
    }, "_GpmPay");
    SIGNATURE_HEADER2 = "X-GPMPay-Signature";
    EVENT_HEADER2 = "X-GPMPay-Event";
    DEFAULT_TOLERANCE_SECONDS2 = 300;
    __name(toBuffer2, "toBuffer");
    __name(parseSignatureHeader2, "parseSignatureHeader");
    __name(assertWebhookSignature2, "assertWebhookSignature");
    __name(verifyWebhookSignature, "verifyWebhookSignature");
    __name(signWebhookPayload, "signWebhookPayload");
    __name(headerValue2, "headerValue");
    __name(constructWebhookEvent2, "constructWebhookEvent");
    __name(crc16ccitt, "crc16ccitt");
    DESCRIPTION_MAX_LENGTH2 = 25;
    tlv = /* @__PURE__ */ __name((id, value) => id + value.length.toString().padStart(2, "0") + value, "tlv");
    __name(isDynamic2, "isDynamic");
    __name(trimDescription2, "trimDescription");
    __name(buildVietQrPayload, "buildVietQrPayload");
    __name(buildVietQrImageUrl2, "buildVietQrImageUrl");
    __name(buildPaymentInstructions, "buildPaymentInstructions");
    ALL_API_SCOPES = [
      "transactions:read",
      "bank-accounts:read",
      "webhooks:manage"
    ];
    WEBHOOK_RETRY_SCHEDULE_SECONDS = [
      10,
      30,
      120,
      600,
      3600,
      21600
    ];
    WEBHOOK_MAX_ATTEMPTS = 6;
    WEBHOOK_DELIVERY_TIMEOUT_MS = 5e3;
  }
});

// .wrangler/tmp/bundle-bJngGf/middleware-loader.entry.ts
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();

// .wrangler/tmp/bundle-bJngGf/middleware-insertion-facade.js
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();

// src/index.ts
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();

// node_modules/hono/dist/index.js
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();

// node_modules/hono/dist/hono.js
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();

// node_modules/hono/dist/hono-base.js
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();

// node_modules/hono/dist/compose.js
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
var compose = /* @__PURE__ */ __name((middleware, onError, onNotFound) => {
  return (context2, next) => {
    let index = -1;
    return dispatch(0);
    async function dispatch(i) {
      if (i <= index) {
        throw new Error("next() called multiple times");
      }
      index = i;
      let res;
      let isError = false;
      let handler;
      if (middleware[i]) {
        handler = middleware[i][0][0];
        context2.req.routeIndex = i;
      } else {
        handler = i === middleware.length && next || void 0;
      }
      if (handler) {
        try {
          res = await handler(context2, () => dispatch(i + 1));
        } catch (err) {
          if (err instanceof Error && onError) {
            context2.error = err;
            res = await onError(err, context2);
            isError = true;
          } else {
            throw err;
          }
        }
      } else {
        if (context2.finalized === false && onNotFound) {
          res = await onNotFound(context2);
        }
      }
      if (res && (context2.finalized === false || isError)) {
        context2.res = res;
      }
      return context2;
    }
    __name(dispatch, "dispatch");
  };
}, "compose");

// node_modules/hono/dist/context.js
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();

// node_modules/hono/dist/request.js
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();

// node_modules/hono/dist/http-exception.js
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();

// node_modules/hono/dist/request/constants.js
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
var GET_MATCH_RESULT = /* @__PURE__ */ Symbol();

// node_modules/hono/dist/utils/body.js
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();

// node_modules/hono/dist/utils/buffer.js
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();

// node_modules/hono/dist/utils/crypto.js
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();

// node_modules/hono/dist/utils/buffer.js
var bufferToFormData = /* @__PURE__ */ __name((arrayBuffer, contentType) => {
  const response = new Response(arrayBuffer, {
    headers: {
      // Normalize the media type (case-insensitive) while keeping parameters like the boundary
      "Content-Type": contentType.replace(/^[^;]+/, (mediaType) => mediaType.toLowerCase())
    }
  });
  return response.formData();
}, "bufferToFormData");

// node_modules/hono/dist/utils/body.js
var MAX_NESTING_DEPTH = 32;
var MAX_NESTED_OBJECTS = 1e4;
var isRawRequest = /* @__PURE__ */ __name((request) => "headers" in request, "isRawRequest");
var parseBody = /* @__PURE__ */ __name(async (request, options = /* @__PURE__ */ Object.create(null)) => {
  const { all = false, dot = false } = options;
  const headers = isRawRequest(request) ? request.headers : request.raw.headers;
  const contentType = headers.get("Content-Type");
  const mediaType = contentType?.split(";")[0].trim().toLowerCase();
  if (mediaType === "multipart/form-data" || mediaType === "application/x-www-form-urlencoded") {
    return parseFormData(request, { all, dot });
  }
  return {};
}, "parseBody");
async function parseFormData(request, options) {
  if (!isRawRequest(request) && request.bodyCache.formData) {
    return convertFormDataToBodyData(
      await request.bodyCache.formData,
      options
    );
  }
  const headers = isRawRequest(request) ? request.headers : request.raw.headers;
  const arrayBuffer = await request.arrayBuffer();
  const formDataPromise = bufferToFormData(arrayBuffer, headers.get("Content-Type") || "");
  if (!isRawRequest(request)) {
    request.bodyCache.formData = formDataPromise;
  }
  const formData = await formDataPromise;
  if (formData) {
    return convertFormDataToBodyData(formData, options);
  }
  return {};
}
__name(parseFormData, "parseFormData");
function convertFormDataToBodyData(formData, options) {
  const form = /* @__PURE__ */ Object.create(null);
  const nestingState = { count: 0 };
  formData.forEach((value, key) => {
    const shouldParseAllValues = options.all || key.endsWith("[]");
    if (!shouldParseAllValues) {
      form[key] = value;
    } else {
      handleParsingAllValues(form, key, value);
    }
  });
  if (options.dot) {
    Object.entries(form).forEach(([key, value]) => {
      const shouldParseDotValues = key.includes(".");
      if (shouldParseDotValues) {
        handleParsingNestedValues(form, key, value, nestingState);
        delete form[key];
      }
    });
  }
  return form;
}
__name(convertFormDataToBodyData, "convertFormDataToBodyData");
var handleParsingAllValues = /* @__PURE__ */ __name((form, key, value) => {
  if (form[key] !== void 0) {
    if (Array.isArray(form[key])) {
      ;
      form[key].push(value);
    } else {
      form[key] = [form[key], value];
    }
  } else {
    if (!key.endsWith("[]")) {
      form[key] = value;
    } else {
      form[key] = [value];
    }
  }
}, "handleParsingAllValues");
var handleParsingNestedValues = /* @__PURE__ */ __name((form, key, value, state) => {
  if (/(?:^|\.)__proto__\./.test(key)) {
    return;
  }
  let nestedForm = form;
  const keys = key.split(".", MAX_NESTING_DEPTH + 2);
  if (keys.length > MAX_NESTING_DEPTH + 1) {
    throwNestingLimitExceeded();
  }
  keys.forEach((key2, index) => {
    if (index === keys.length - 1) {
      nestedForm[key2] = value;
    } else {
      if (!nestedForm[key2] || typeof nestedForm[key2] !== "object" || Array.isArray(nestedForm[key2]) || nestedForm[key2] instanceof File) {
        if (state.count++ >= MAX_NESTED_OBJECTS) {
          throwNestingLimitExceeded();
        }
        nestedForm[key2] = /* @__PURE__ */ Object.create(null);
      }
      nestedForm = nestedForm[key2];
    }
  });
}, "handleParsingNestedValues");
var throwNestingLimitExceeded = /* @__PURE__ */ __name(() => {
  throw new Error("Nesting limit exceeded");
}, "throwNestingLimitExceeded");

// node_modules/hono/dist/utils/url.js
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
var splitPath = /* @__PURE__ */ __name((path) => {
  const paths = path.split("/");
  if (paths[0] === "") {
    paths.shift();
  }
  return paths;
}, "splitPath");
var splitRoutingPath = /* @__PURE__ */ __name((routePath) => {
  const { groups, path } = extractGroupsFromPath(routePath);
  const paths = splitPath(path);
  return replaceGroupMarks(paths, groups);
}, "splitRoutingPath");
var extractGroupsFromPath = /* @__PURE__ */ __name((path) => {
  const groups = [];
  path = path.replace(/\{[^}]+\}/g, (match2, index) => {
    const mark = `@${index}`;
    groups.push([mark, match2]);
    return mark;
  });
  return { groups, path };
}, "extractGroupsFromPath");
var replaceGroupMarks = /* @__PURE__ */ __name((paths, groups) => {
  for (let i = groups.length - 1; i >= 0; i--) {
    const [mark] = groups[i];
    for (let j = paths.length - 1; j >= 0; j--) {
      if (paths[j].includes(mark)) {
        paths[j] = paths[j].replace(mark, groups[i][1]);
        break;
      }
    }
  }
  return paths;
}, "replaceGroupMarks");
var patternCache = {};
var getPattern = /* @__PURE__ */ __name((label, next) => {
  if (label === "*") {
    return "*";
  }
  const match2 = label.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
  if (match2) {
    const cacheKey = `${label}#${next}`;
    if (!patternCache[cacheKey]) {
      if (match2[2]) {
        patternCache[cacheKey] = next && next[0] !== ":" && next[0] !== "*" ? [cacheKey, match2[1], new RegExp(`^${match2[2]}(?=/${next})`)] : [label, match2[1], new RegExp(`^${match2[2]}$`)];
      } else {
        patternCache[cacheKey] = [label, match2[1], true];
      }
    }
    return patternCache[cacheKey];
  }
  return null;
}, "getPattern");
var tryDecode = /* @__PURE__ */ __name((str, decoder) => {
  try {
    return decoder(str);
  } catch {
    return str.replace(/(?:%[0-9A-Fa-f]{2})+/g, (match2) => {
      try {
        return decoder(match2);
      } catch {
        return match2;
      }
    });
  }
}, "tryDecode");
var tryDecodeURI = /* @__PURE__ */ __name((str) => tryDecode(str, decodeURI), "tryDecodeURI");
var getPath = /* @__PURE__ */ __name((request) => {
  const url = request.url;
  const start = url.indexOf("/", url.indexOf(":") + 4);
  let i = start;
  for (; i < url.length; i++) {
    const charCode = url.charCodeAt(i);
    if (charCode === 37) {
      const queryIndex = url.indexOf("?", i);
      const hashIndex = url.indexOf("#", i);
      const end = queryIndex === -1 ? hashIndex === -1 ? void 0 : hashIndex : hashIndex === -1 ? queryIndex : Math.min(queryIndex, hashIndex);
      const path = url.slice(start, end);
      return tryDecodeURI(path.includes("%25") ? path.replace(/%25/g, "%2525") : path);
    } else if (charCode === 63 || charCode === 35) {
      break;
    }
  }
  return url.slice(start, i);
}, "getPath");
var getPathNoStrict = /* @__PURE__ */ __name((request) => {
  const result = getPath(request);
  return result.length > 1 && result.at(-1) === "/" ? result.slice(0, -1) : result;
}, "getPathNoStrict");
var mergePath = /* @__PURE__ */ __name((base, sub, ...rest) => {
  if (rest.length) {
    sub = mergePath(sub, ...rest);
  }
  return `${base?.[0] === "/" ? "" : "/"}${base}${sub === "/" ? "" : `${base?.at(-1) === "/" ? "" : "/"}${sub?.[0] === "/" ? sub.slice(1) : sub}`}`;
}, "mergePath");
var checkOptionalParameter = /* @__PURE__ */ __name((path) => {
  if (path.charCodeAt(path.length - 1) !== 63 || !path.includes(":")) {
    return null;
  }
  const segments = path.split("/");
  const results = [];
  let basePath = "";
  segments.forEach((segment) => {
    if (segment !== "" && !/\:/.test(segment)) {
      basePath += "/" + segment;
    } else if (/\:/.test(segment)) {
      if (segment.charCodeAt(segment.length - 1) === 63) {
        if (results.length === 0 && basePath === "") {
          results.push("/");
        } else {
          results.push(basePath);
        }
        const optionalSegment = segment.slice(0, -1);
        basePath += "/" + optionalSegment;
        results.push(basePath);
      } else {
        basePath += "/" + segment;
      }
    }
  });
  return results.filter((v, i, a) => a.indexOf(v) === i);
}, "checkOptionalParameter");
var tryDecodeURIComponent = /* @__PURE__ */ __name((str) => str.indexOf("%") !== -1 ? tryDecode(str, decodeURIComponent_) : str, "tryDecodeURIComponent");
var _decodeURI = /* @__PURE__ */ __name((value) => {
  if (value.indexOf("+") !== -1) {
    value = value.replace(/\+/g, " ");
  }
  return tryDecodeURIComponent(value);
}, "_decodeURI");
var _getQueryParam = /* @__PURE__ */ __name((url, key, multiple) => {
  const hashIndex = url.indexOf("#", 8);
  if (hashIndex !== -1) {
    url = url.slice(0, hashIndex);
  }
  let encoded;
  if (!multiple && key && key.indexOf("%") === -1 && key.indexOf("+") === -1) {
    let keyIndex2 = url.indexOf("?", 8);
    if (keyIndex2 === -1) {
      return void 0;
    }
    if (!url.startsWith(key, keyIndex2 + 1)) {
      keyIndex2 = url.indexOf(`&${key}`, keyIndex2 + 1);
    }
    while (keyIndex2 !== -1) {
      const trailingKeyCode = url.charCodeAt(keyIndex2 + key.length + 1);
      if (trailingKeyCode === 61) {
        const valueIndex = keyIndex2 + key.length + 2;
        const endIndex = url.indexOf("&", valueIndex);
        return _decodeURI(url.slice(valueIndex, endIndex === -1 ? void 0 : endIndex));
      } else if (trailingKeyCode == 38 || isNaN(trailingKeyCode)) {
        return "";
      }
      keyIndex2 = url.indexOf(`&${key}`, keyIndex2 + 1);
    }
    encoded = /[%+]/.test(url);
    if (!encoded) {
      return void 0;
    }
  }
  const results = /* @__PURE__ */ Object.create(null);
  encoded ??= /[%+]/.test(url);
  let keyIndex = url.indexOf("?", 8);
  while (keyIndex !== -1) {
    const nextKeyIndex = url.indexOf("&", keyIndex + 1);
    let valueIndex = url.indexOf("=", keyIndex);
    if (valueIndex > nextKeyIndex && nextKeyIndex !== -1) {
      valueIndex = -1;
    }
    let name = url.slice(
      keyIndex + 1,
      valueIndex === -1 ? nextKeyIndex === -1 ? void 0 : nextKeyIndex : valueIndex
    );
    if (encoded) {
      name = _decodeURI(name);
    }
    keyIndex = nextKeyIndex;
    if (name === "") {
      continue;
    }
    let value;
    if (valueIndex === -1) {
      value = "";
    } else {
      value = url.slice(valueIndex + 1, nextKeyIndex === -1 ? void 0 : nextKeyIndex);
      if (encoded) {
        value = _decodeURI(value);
      }
    }
    if (multiple) {
      if (!(results[name] && Array.isArray(results[name]))) {
        results[name] = [];
      }
      ;
      results[name].push(value);
    } else {
      results[name] ??= value;
    }
  }
  return key ? results[key] : results;
}, "_getQueryParam");
var getQueryParam = _getQueryParam;
var getQueryParams = /* @__PURE__ */ __name((url, key) => {
  return _getQueryParam(url, key, true);
}, "getQueryParams");
var decodeURIComponent_ = decodeURIComponent;

// node_modules/hono/dist/request.js
var HonoRequest = /* @__PURE__ */ __name(class {
  /**
   * `.raw` can get the raw Request object.
   *
   * @see {@link https://hono.dev/docs/api/request#raw}
   *
   * @example
   * ```ts
   * // For Cloudflare Workers
   * app.post('/', async (c) => {
   *   const metadata = c.req.raw.cf?.hostMetadata?
   *   ...
   * })
   * ```
   */
  raw;
  #validatedData;
  // Short name of validatedData
  #matchResult;
  routeIndex = 0;
  /**
   * `.path` can get the pathname of the request.
   *
   * @see {@link https://hono.dev/docs/api/request#path}
   *
   * @example
   * ```ts
   * app.get('/about/me', (c) => {
   *   const pathname = c.req.path // `/about/me`
   * })
   * ```
   */
  path;
  bodyCache = {};
  constructor(request, path = "/", matchResult = [[]]) {
    this.raw = request;
    this.path = path;
    this.#matchResult = matchResult;
  }
  param(key) {
    return key ? this.#getDecodedParam(key) : this.#getAllDecodedParams();
  }
  #getDecodedParam(key) {
    const paramKey = this.#matchResult[0][this.routeIndex]?.[1][key];
    const param = this.#getParamValue(paramKey);
    return param && tryDecodeURIComponent(param);
  }
  #getAllDecodedParams() {
    const decoded = {};
    const keys = Object.keys(this.#matchResult[0][this.routeIndex]?.[1] ?? {});
    for (const key of keys) {
      const value = this.#getParamValue(this.#matchResult[0][this.routeIndex][1][key]);
      if (value !== void 0) {
        decoded[key] = tryDecodeURIComponent(value);
      }
    }
    return decoded;
  }
  #getParamValue(paramKey) {
    return this.#matchResult[1] ? this.#matchResult[1][paramKey] : paramKey;
  }
  query(key) {
    return getQueryParam(this.url, key);
  }
  queries(key) {
    return getQueryParams(this.url, key);
  }
  header(name) {
    if (name) {
      return this.raw.headers.get(name) ?? void 0;
    }
    const headerData = /* @__PURE__ */ Object.create(null);
    this.raw.headers.forEach((value, key) => {
      headerData[key] = value;
    });
    return headerData;
  }
  async parseBody(options) {
    return parseBody(this, options);
  }
  #cachedBody = (key) => {
    const { bodyCache, raw: raw2 } = this;
    const cachedBody = bodyCache[key];
    if (cachedBody) {
      return cachedBody;
    }
    for (const anyCachedKey in bodyCache) {
      return bodyCache[anyCachedKey].then((body) => {
        if (anyCachedKey === "json") {
          body = JSON.stringify(body);
        }
        return new Response(body)[key]();
      });
    }
    return bodyCache[key] = raw2[key]();
  };
  /**
   * `.json()` can parse Request body of type `application/json`
   *
   * @see {@link https://hono.dev/docs/api/request#json}
   *
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.json()
   * })
   * ```
   */
  json() {
    return this.#cachedBody("text").then((text) => JSON.parse(text));
  }
  /**
   * `.text()` can parse Request body of type `text/plain`
   *
   * @see {@link https://hono.dev/docs/api/request#text}
   *
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.text()
   * })
   * ```
   */
  text() {
    return this.#cachedBody("text");
  }
  /**
   * `.arrayBuffer()` parse Request body as an `ArrayBuffer`
   *
   * @see {@link https://hono.dev/docs/api/request#arraybuffer}
   *
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.arrayBuffer()
   * })
   * ```
   */
  arrayBuffer() {
    return this.#cachedBody("arrayBuffer");
  }
  /**
   * `.bytes()` parses the request body as a `Uint8Array`.
   *
   * @see {@link https://hono.dev/docs/api/request#bytes}
   *
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.bytes()
   * })
   * ```
   */
  bytes() {
    return this.#cachedBody("arrayBuffer").then((buffer) => new Uint8Array(buffer));
  }
  /**
   * Parses the request body as a `Blob`.
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.blob();
   * });
   * ```
   * @see https://hono.dev/docs/api/request#blob
   */
  blob() {
    return this.#cachedBody("blob");
  }
  /**
   * Parses the request body as `FormData`.
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.formData();
   * });
   * ```
   * @see https://hono.dev/docs/api/request#formdata
   */
  formData() {
    return this.#cachedBody("formData");
  }
  /**
   * Adds validated data to the request.
   *
   * @param target - The target of the validation.
   * @param data - The validated data to add.
   */
  addValidatedData(target, data) {
    ;
    (this.#validatedData ??= {})[target] = data;
  }
  valid(target) {
    return this.#validatedData?.[target];
  }
  /**
   * `.url()` can get the request url strings.
   *
   * @see {@link https://hono.dev/docs/api/request#url}
   *
   * @example
   * ```ts
   * app.get('/about/me', (c) => {
   *   const url = c.req.url // `http://localhost:8787/about/me`
   *   ...
   * })
   * ```
   */
  get url() {
    return this.raw.url;
  }
  /**
   * `.method()` can get the method name of the request.
   *
   * @see {@link https://hono.dev/docs/api/request#method}
   *
   * @example
   * ```ts
   * app.get('/about/me', (c) => {
   *   const method = c.req.method // `GET`
   * })
   * ```
   */
  get method() {
    return this.raw.method;
  }
  get [GET_MATCH_RESULT]() {
    return this.#matchResult;
  }
  /**
   * `.matchedRoutes()` can return a matched route in the handler
   *
   * @deprecated
   *
   * Use matchedRoutes helper defined in "hono/route" instead.
   *
   * @see {@link https://hono.dev/docs/api/request#matchedroutes}
   *
   * @example
   * ```ts
   * app.use('*', async function logger(c, next) {
   *   await next()
   *   c.req.matchedRoutes.forEach(({ handler, method, path }, i) => {
   *     const name = handler.name || (handler.length < 2 ? '[handler]' : '[middleware]')
   *     console.log(
   *       method,
   *       ' ',
   *       path,
   *       ' '.repeat(Math.max(10 - path.length, 0)),
   *       name,
   *       i === c.req.routeIndex ? '<- respond from here' : ''
   *     )
   *   })
   * })
   * ```
   */
  get matchedRoutes() {
    return this.#matchResult[0].map(([[, route]]) => route);
  }
  /**
   * `routePath()` can retrieve the path registered within the handler
   *
   * @deprecated
   *
   * Use routePath helper defined in "hono/route" instead.
   *
   * @see {@link https://hono.dev/docs/api/request#routepath}
   *
   * @example
   * ```ts
   * app.get('/posts/:id', (c) => {
   *   return c.json({ path: c.req.routePath })
   * })
   * ```
   */
  get routePath() {
    return this.#matchResult[0].map(([[, route]]) => route)[this.routeIndex].path;
  }
}, "HonoRequest");

// node_modules/hono/dist/utils/html.js
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
var HtmlEscapedCallbackPhase = {
  Stringify: 1,
  BeforeStream: 2,
  Stream: 3
};
var raw = /* @__PURE__ */ __name((value, callbacks) => {
  const escapedString = new String(value);
  escapedString.isEscaped = true;
  escapedString.callbacks = callbacks;
  return escapedString;
}, "raw");
var resolveCallback = /* @__PURE__ */ __name(async (str, phase, preserveCallbacks, context2, buffer) => {
  if (typeof str === "object" && !(str instanceof String)) {
    if (!(str instanceof Promise)) {
      str = str.toString();
    }
    if (str instanceof Promise) {
      str = await str;
    }
  }
  const callbacks = str.callbacks;
  if (!callbacks?.length) {
    return Promise.resolve(str);
  }
  if (buffer) {
    buffer[0] += str;
  } else {
    buffer = [str];
  }
  const resStr = Promise.all(callbacks.map((c) => c({ phase, buffer, context: context2 }))).then(
    (res) => Promise.all(
      res.filter(Boolean).map((str2) => resolveCallback(str2, phase, false, context2, buffer))
    ).then(() => buffer[0])
  );
  if (preserveCallbacks) {
    return raw(await resStr, callbacks);
  } else {
    return resStr;
  }
}, "resolveCallback");

// node_modules/hono/dist/context.js
var TEXT_PLAIN = "text/plain; charset=UTF-8";
var setDefaultContentType = /* @__PURE__ */ __name((contentType, headers) => {
  return {
    "Content-Type": contentType,
    ...headers
  };
}, "setDefaultContentType");
var createResponseInstance = /* @__PURE__ */ __name((body, init) => new Response(body, init), "createResponseInstance");
var Context = /* @__PURE__ */ __name(class {
  #rawRequest;
  #req;
  /**
   * `.env` can get bindings (environment variables, secrets, KV namespaces, D1 database, R2 bucket etc.) in Cloudflare Workers.
   *
   * @see {@link https://hono.dev/docs/api/context#env}
   *
   * @example
   * ```ts
   * // Environment object for Cloudflare Workers
   * app.get('*', async c => {
   *   const counter = c.env.COUNTER
   * })
   * ```
   */
  env = {};
  #var;
  finalized = false;
  /**
   * `.error` can get the error object from the middleware if the Handler throws an error.
   *
   * @see {@link https://hono.dev/docs/api/context#error}
   *
   * @example
   * ```ts
   * app.use('*', async (c, next) => {
   *   await next()
   *   if (c.error) {
   *     // do something...
   *   }
   * })
   * ```
   */
  error;
  #status;
  #executionCtx;
  #res;
  #layout;
  #renderer;
  #notFoundHandler;
  #preparedHeaders;
  #matchResult;
  #path;
  /**
   * Creates an instance of the Context class.
   *
   * @param req - The Request object.
   * @param options - Optional configuration options for the context.
   */
  constructor(req, options) {
    this.#rawRequest = req;
    if (options) {
      this.#executionCtx = options.executionCtx;
      this.env = options.env;
      this.#notFoundHandler = options.notFoundHandler;
      this.#path = options.path;
      this.#matchResult = options.matchResult;
    }
  }
  /**
   * `.req` is the instance of {@link HonoRequest}.
   */
  get req() {
    this.#req ??= new HonoRequest(this.#rawRequest, this.#path, this.#matchResult);
    return this.#req;
  }
  /**
   * @see {@link https://hono.dev/docs/api/context#event}
   * The FetchEvent associated with the current request.
   *
   * @throws Will throw an error if the context does not have a FetchEvent.
   */
  get event() {
    if (this.#executionCtx && "respondWith" in this.#executionCtx) {
      return this.#executionCtx;
    } else {
      throw Error("This context has no FetchEvent");
    }
  }
  /**
   * @see {@link https://hono.dev/docs/api/context#executionctx}
   * The ExecutionContext associated with the current request.
   *
   * @throws Will throw an error if the context does not have an ExecutionContext.
   */
  get executionCtx() {
    if (this.#executionCtx) {
      return this.#executionCtx;
    } else {
      throw Error("This context has no ExecutionContext");
    }
  }
  /**
   * @see {@link https://hono.dev/docs/api/context#res}
   * The Response object for the current request.
   */
  get res() {
    return this.#res ||= createResponseInstance(null, {
      headers: this.#preparedHeaders ??= new Headers()
    });
  }
  /**
   * Sets the Response object for the current request.
   *
   * @param _res - The Response object to set.
   */
  set res(_res) {
    if (this.#res && _res) {
      _res = createResponseInstance(_res.body, _res);
      for (const [k, v] of this.#res.headers.entries()) {
        if (k === "content-type") {
          continue;
        }
        if (k === "set-cookie") {
          const cookies = this.#res.headers.getSetCookie();
          _res.headers.delete("set-cookie");
          for (const cookie of cookies) {
            _res.headers.append("set-cookie", cookie);
          }
        } else {
          _res.headers.set(k, v);
        }
      }
    }
    this.#res = _res;
    this.finalized = true;
  }
  /**
   * `.render()` can create a response within a layout.
   *
   * @see {@link https://hono.dev/docs/api/context#render-setrenderer}
   *
   * @example
   * ```ts
   * app.get('/', (c) => {
   *   return c.render('Hello!')
   * })
   * ```
   */
  render = (...args) => {
    this.#renderer ??= (content) => this.html(content);
    return this.#renderer(...args);
  };
  /**
   * Sets the layout for the response.
   *
   * @param layout - The layout to set.
   * @returns The layout function.
   */
  setLayout = (layout) => this.#layout = layout;
  /**
   * Gets the current layout for the response.
   *
   * @returns The current layout function.
   */
  getLayout = () => this.#layout;
  /**
   * `.setRenderer()` can set the layout in the custom middleware.
   *
   * @see {@link https://hono.dev/docs/api/context#render-setrenderer}
   *
   * @example
   * ```tsx
   * app.use('*', async (c, next) => {
   *   c.setRenderer((content) => {
   *     return c.html(
   *       <html>
   *         <body>
   *           <p>{content}</p>
   *         </body>
   *       </html>
   *     )
   *   })
   *   await next()
   * })
   * ```
   */
  setRenderer = (renderer) => {
    this.#renderer = renderer;
  };
  /**
   * `.header()` can set headers.
   *
   * @see {@link https://hono.dev/docs/api/context#header}
   *
   * @example
   * ```ts
   * app.get('/welcome', (c) => {
   *   // Set headers
   *   c.header('X-Message', 'Hello!')
   *   c.header('Content-Type', 'text/plain')
   *
   *   // Append multiple headers using the append option (e.g. Vary)
   *   c.header('Vary', 'Accept-Encoding', { append: true })
   *   c.header('Vary', 'User-Agent', { append: true })
   *
   *   return c.body('Thank you for coming')
   * })
   * ```
   */
  header = (name, value, options) => {
    if (this.finalized) {
      this.#res = createResponseInstance(this.#res.body, this.#res);
    }
    const headers = this.#res ? this.#res.headers : this.#preparedHeaders ??= new Headers();
    if (value === void 0) {
      headers.delete(name);
    } else if (options?.append) {
      headers.append(name, value);
    } else {
      headers.set(name, value);
    }
  };
  status = (status) => {
    this.#status = status;
  };
  /**
   * `.set()` can set the value specified by the key.
   *
   * @see {@link https://hono.dev/docs/api/context#set-get}
   *
   * @example
   * ```ts
   * app.use('*', async (c, next) => {
   *   c.set('message', 'Hono is hot!!')
   *   await next()
   * })
   * ```
   */
  set = (key, value) => {
    this.#var ??= /* @__PURE__ */ new Map();
    this.#var.set(key, value);
  };
  /**
   * `.get()` can use the value specified by the key.
   *
   * @see {@link https://hono.dev/docs/api/context#set-get}
   *
   * @example
   * ```ts
   * app.get('/', (c) => {
   *   const message = c.get('message')
   *   return c.text(`The message is "${message}"`)
   * })
   * ```
   */
  get = (key) => {
    return this.#var ? this.#var.get(key) : void 0;
  };
  /**
   * `.var` can access the value of a variable.
   *
   * @see {@link https://hono.dev/docs/api/context#var}
   *
   * @example
   * ```ts
   * const result = c.var.client.oneMethod()
   * ```
   */
  // c.var.propName is a read-only
  get var() {
    if (!this.#var) {
      return {};
    }
    return Object.fromEntries(this.#var);
  }
  #newResponse(data, arg, headers) {
    let responseHeaders = this.#res ? new Headers(this.#res.headers) : this.#preparedHeaders;
    if (typeof arg === "object" && arg.headers) {
      responseHeaders ??= new Headers();
      for (const [key, value] of new Headers(arg.headers)) {
        if (key === "set-cookie") {
          responseHeaders.append(key, value);
        } else {
          responseHeaders.set(key, value);
        }
      }
    }
    if (headers) {
      if (!responseHeaders) {
        let count3 = 0;
        for (const k in headers) {
          if (++count3 > 1 || typeof headers[k] !== "string") {
            responseHeaders = new Headers();
            break;
          }
        }
      }
      if (responseHeaders) {
        for (const k in headers) {
          const v = headers[k];
          if (typeof v === "string") {
            responseHeaders.set(k, v);
          } else {
            responseHeaders.delete(k);
            for (const v2 of v) {
              responseHeaders.append(k, v2);
            }
          }
        }
      }
    }
    const status = typeof arg === "number" ? arg : arg?.status ?? this.#status;
    return createResponseInstance(data, {
      status,
      headers: responseHeaders ?? headers
    });
  }
  newResponse = (...args) => this.#newResponse(...args);
  /**
   * `.body()` can return the HTTP response.
   * You can set headers with `.header()` and set HTTP status code with `.status`.
   * This can also be set in `.text()`, `.json()` and so on.
   *
   * @see {@link https://hono.dev/docs/api/context#body}
   *
   * @example
   * ```ts
   * app.get('/welcome', (c) => {
   *   // Set headers
   *   c.header('X-Message', 'Hello!')
   *   c.header('Content-Type', 'text/plain')
   *   // Set HTTP status code
   *   c.status(201)
   *
   *   // Return the response body
   *   return c.body('Thank you for coming')
   * })
   * ```
   */
  body = (data, arg, headers) => this.#newResponse(data, arg, headers);
  /**
   * `.text()` can render text as `Content-Type:text/plain`.
   *
   * @see {@link https://hono.dev/docs/api/context#text}
   *
   * @example
   * ```ts
   * app.get('/say', (c) => {
   *   return c.text('Hello!')
   * })
   * ```
   */
  text = (text, arg, headers) => {
    return !this.#preparedHeaders && !this.#status && !arg && !headers && !this.finalized ? new Response(text) : this.#newResponse(
      text,
      arg,
      setDefaultContentType(TEXT_PLAIN, headers)
    );
  };
  /**
   * `.json()` can render JSON as `Content-Type:application/json`.
   *
   * @see {@link https://hono.dev/docs/api/context#json}
   *
   * @example
   * ```ts
   * app.get('/api', (c) => {
   *   return c.json({ message: 'Hello!' })
   * })
   * ```
   */
  json = (object, arg, headers) => {
    return this.#newResponse(
      JSON.stringify(object),
      arg,
      setDefaultContentType("application/json", headers)
    );
  };
  html = (html, arg, headers) => {
    const res = /* @__PURE__ */ __name((html2) => this.#newResponse(html2, arg, setDefaultContentType("text/html; charset=UTF-8", headers)), "res");
    return typeof html === "object" ? resolveCallback(html, HtmlEscapedCallbackPhase.Stringify, false, {}).then(res) : res(html);
  };
  /**
   * `.redirect()` can Redirect, default status code is 302.
   *
   * @see {@link https://hono.dev/docs/api/context#redirect}
   *
   * @example
   * ```ts
   * app.get('/redirect', (c) => {
   *   return c.redirect('/')
   * })
   * app.get('/redirect-permanently', (c) => {
   *   return c.redirect('/', 301)
   * })
   * ```
   */
  redirect = (location, status) => {
    const locationString = String(location);
    this.header(
      "Location",
      // Multibyes should be encoded
      // eslint-disable-next-line no-control-regex
      !/[^\x00-\xFF]/.test(locationString) ? locationString : encodeURI(locationString)
    );
    return this.newResponse(null, status ?? 302);
  };
  /**
   * `.notFound()` can return the Not Found Response.
   *
   * @see {@link https://hono.dev/docs/api/context#notfound}
   *
   * @example
   * ```ts
   * app.get('/notfound', (c) => {
   *   return c.notFound()
   * })
   * ```
   */
  notFound = () => {
    this.#notFoundHandler ??= () => createResponseInstance();
    return this.#notFoundHandler(this);
  };
}, "Context");

// node_modules/hono/dist/router.js
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
var METHOD_NAME_ALL = "ALL";
var METHOD_NAME_ALL_LOWERCASE = "all";
var METHODS = ["get", "post", "put", "delete", "options", "patch", "query"];
var MESSAGE_MATCHER_IS_ALREADY_BUILT = "Can not add a route since the matcher is already built.";
var UnsupportedPathError = /* @__PURE__ */ __name(class extends Error {
}, "UnsupportedPathError");

// node_modules/hono/dist/utils/constants.js
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
var COMPOSED_HANDLER = "__COMPOSED_HANDLER";

// node_modules/hono/dist/hono-base.js
var notFoundHandler = /* @__PURE__ */ __name((c) => {
  return c.text("404 Not Found", 404);
}, "notFoundHandler");
var errorHandler = /* @__PURE__ */ __name((err, c) => {
  if ("getResponse" in err) {
    const res = err.getResponse();
    return c.newResponse(res.body, res);
  }
  console.error(err);
  return c.text("Internal Server Error", 500);
}, "errorHandler");
var Hono = /* @__PURE__ */ __name(class _Hono {
  get;
  post;
  put;
  delete;
  options;
  patch;
  query;
  all;
  on;
  use;
  /*
    This class is like an abstract class and does not have a router.
    To use it, inherit the class and implement router in the constructor.
  */
  router;
  getPath;
  // Cannot use `#` because it requires visibility at JavaScript runtime.
  _basePath = "/";
  #path = "/";
  routes = [];
  constructor(options = {}) {
    const allMethods = [...METHODS, METHOD_NAME_ALL_LOWERCASE];
    allMethods.forEach((method) => {
      this[method] = (args1, ...args) => {
        const methodName = method.toUpperCase();
        if (typeof args1 === "string") {
          this.#path = args1;
        } else {
          this.#addRoute(methodName, this.#path, args1);
        }
        args.forEach((handler) => {
          this.#addRoute(methodName, this.#path, handler);
        });
        return this;
      };
    });
    this.on = (method, path, ...handlers) => {
      for (const p of [path].flat()) {
        this.#path = p;
        for (const m of [method].flat()) {
          const methodName = m.toUpperCase();
          for (const handler of handlers) {
            this.#addRoute(methodName, this.#path, handler);
          }
        }
      }
      return this;
    };
    this.use = (arg1, ...handlers) => {
      if (typeof arg1 === "string") {
        this.#path = arg1;
      } else {
        this.#path = "*";
        handlers.unshift(arg1);
      }
      handlers.forEach((handler) => {
        this.#addRoute(METHOD_NAME_ALL, this.#path, handler);
      });
      return this;
    };
    const { strict, ...optionsWithoutStrict } = options;
    Object.assign(this, optionsWithoutStrict);
    this.getPath = strict ?? true ? options.getPath ?? getPath : getPathNoStrict;
  }
  #clone() {
    const clone = new _Hono({
      router: this.router,
      getPath: this.getPath
    });
    clone.errorHandler = this.errorHandler;
    clone.#notFoundHandler = this.#notFoundHandler;
    clone.routes = this.routes;
    return clone;
  }
  #notFoundHandler = notFoundHandler;
  // Cannot use `#` because it requires visibility at JavaScript runtime.
  errorHandler = errorHandler;
  /**
   * `.route()` allows grouping other Hono instance in routes.
   *
   * @see {@link https://hono.dev/docs/api/routing#grouping}
   *
   * @param {string} path - base Path
   * @param {Hono} app - other Hono instance
   * @returns {Hono} routed Hono instance
   *
   * @example
   * ```ts
   * const app = new Hono()
   * const app2 = new Hono()
   *
   * app2.get("/user", (c) => c.text("user"))
   * app.route("/api", app2) // GET /api/user
   * ```
   */
  route(path, app2) {
    const subApp = this.basePath(path);
    app2.routes.map((r) => {
      let handler;
      if (app2.errorHandler === errorHandler) {
        handler = r.handler;
      } else {
        handler = /* @__PURE__ */ __name(async (c, next) => (await compose([], app2.errorHandler)(c, () => r.handler(c, next))).res, "handler");
        handler[COMPOSED_HANDLER] = r.handler;
      }
      subApp.#addRoute(r.method, r.path, handler, r.basePath);
    });
    return this;
  }
  /**
   * `.basePath()` allows base paths to be specified.
   *
   * @see {@link https://hono.dev/docs/api/routing#base-path}
   *
   * @param {string} path - base Path
   * @returns {Hono} changed Hono instance
   *
   * @example
   * ```ts
   * const api = new Hono().basePath('/api')
   * ```
   */
  basePath(path) {
    const subApp = this.#clone();
    subApp._basePath = mergePath(this._basePath, path);
    return subApp;
  }
  /**
   * `.onError()` handles an error and returns a customized Response.
   *
   * @see {@link https://hono.dev/docs/api/hono#error-handling}
   *
   * @param {ErrorHandler} handler - request Handler for error
   * @returns {Hono} changed Hono instance
   *
   * @example
   * ```ts
   * app.onError((err, c) => {
   *   console.error(`${err}`)
   *   return c.text('Custom Error Message', 500)
   * })
   * ```
   */
  onError = (handler) => {
    this.errorHandler = handler;
    return this;
  };
  /**
   * `.notFound()` allows you to customize a Not Found Response.
   *
   * @see {@link https://hono.dev/docs/api/hono#not-found}
   *
   * @param {NotFoundHandler} handler - request handler for not-found
   * @returns {Hono} changed Hono instance
   *
   * @example
   * ```ts
   * app.notFound((c) => {
   *   return c.text('Custom 404 Message', 404)
   * })
   * ```
   */
  notFound = (handler) => {
    this.#notFoundHandler = handler;
    return this;
  };
  /**
   * `.mount()` allows you to mount applications built with other frameworks into your Hono application.
   *
   * @see {@link https://hono.dev/docs/api/hono#mount}
   *
   * @param {string} path - base Path
   * @param {Function} applicationHandler - other Request Handler
   * @param {MountOptions} [options] - options of `.mount()`
   * @returns {Hono} mounted Hono instance
   *
   * @example
   * ```ts
   * import { Router as IttyRouter } from 'itty-router'
   * import { Hono } from 'hono'
   * // Create itty-router application
   * const ittyRouter = IttyRouter()
   * // GET /itty-router/hello
   * ittyRouter.get('/hello', () => new Response('Hello from itty-router'))
   *
   * const app = new Hono()
   * app.mount('/itty-router', ittyRouter.handle)
   * ```
   *
   * @example
   * ```ts
   * const app = new Hono()
   * // Send the request to another application without modification.
   * app.mount('/app', anotherApp, {
   *   replaceRequest: (req) => req,
   * })
   * ```
   */
  mount(path, applicationHandler, options) {
    let replaceRequest;
    let optionHandler;
    if (options) {
      if (typeof options === "function") {
        optionHandler = options;
      } else {
        optionHandler = options.optionHandler;
        if (options.replaceRequest === false) {
          replaceRequest = /* @__PURE__ */ __name((request) => request, "replaceRequest");
        } else {
          replaceRequest = options.replaceRequest;
        }
      }
    }
    const getOptions = optionHandler ? (c) => {
      const options2 = optionHandler(c);
      return Array.isArray(options2) ? options2 : [options2];
    } : (c) => {
      let executionContext = void 0;
      try {
        executionContext = c.executionCtx;
      } catch {
      }
      return [c.env, executionContext];
    };
    replaceRequest ||= (() => {
      const mergedPath = mergePath(this._basePath, path);
      const pathPrefixLength = mergedPath === "/" ? 0 : mergedPath.length;
      return (request) => {
        const url = new URL(request.url);
        url.pathname = this.getPath(request).slice(pathPrefixLength) || "/";
        return new Request(url, request);
      };
    })();
    const handler = /* @__PURE__ */ __name(async (c, next) => {
      const res = await applicationHandler(replaceRequest(c.req.raw), ...getOptions(c));
      if (res) {
        return res;
      }
      await next();
    }, "handler");
    this.#addRoute(METHOD_NAME_ALL, mergePath(path, "*"), handler);
    return this;
  }
  #addRoute(method, path, handler, baseRoutePath) {
    path = mergePath(this._basePath, path);
    const r = {
      basePath: baseRoutePath !== void 0 ? mergePath(this._basePath, baseRoutePath) : this._basePath,
      path,
      method,
      handler
    };
    this.router.add(method, path, [handler, r]);
    this.routes.push(r);
  }
  #handleError(err, c) {
    if (err instanceof Error) {
      return this.errorHandler(err, c);
    }
    throw err;
  }
  #dispatch(request, executionCtx, env2, method) {
    if (method === "HEAD") {
      return (async () => new Response(null, await this.#dispatch(request, executionCtx, env2, "GET")))();
    }
    const path = this.getPath(request, { env: env2 });
    const matchResult = this.router.match(method, path);
    const c = new Context(request, {
      path,
      matchResult,
      env: env2,
      executionCtx,
      notFoundHandler: this.#notFoundHandler
    });
    if (matchResult[0].length === 1) {
      let res;
      try {
        res = matchResult[0][0][0][0](c, async () => {
          c.res = await this.#notFoundHandler(c);
        });
      } catch (err) {
        return this.#handleError(err, c);
      }
      return res instanceof Promise ? res.then(
        (resolved) => resolved || (c.finalized ? c.res : this.#notFoundHandler(c))
      ).catch((err) => this.#handleError(err, c)) : res ?? this.#notFoundHandler(c);
    }
    const composed = compose(matchResult[0], this.errorHandler, this.#notFoundHandler);
    return (async () => {
      try {
        const context2 = await composed(c);
        if (!context2.finalized) {
          throw new Error(
            "Context is not finalized. Did you forget to return a Response object or `await next()`?"
          );
        }
        return context2.res;
      } catch (err) {
        return this.#handleError(err, c);
      }
    })();
  }
  /**
   * `.fetch()` will be entry point of your app.
   *
   * @see {@link https://hono.dev/docs/api/hono#fetch}
   *
   * @param {Request} request - request Object of request
   * @param {Env} env - env Object
   * @param {ExecutionContext} executionCtx - context of execution
   * @returns {Response | Promise<Response>} response of request
   *
   */
  fetch = (request, ...rest) => {
    return this.#dispatch(request, rest[1], rest[0], request.method);
  };
  /**
   * `.request()` is a useful method for testing.
   * You can pass a URL or pathname to send a GET request.
   * app will return a Response object.
   * ```ts
   * test('GET /hello is ok', async () => {
   *   const res = await app.request('/hello')
   *   expect(res.status).toBe(200)
   * })
   * ```
   * @see https://hono.dev/docs/api/hono#request
   */
  request = (input, requestInit, Env, executionCtx) => {
    if (input instanceof Request) {
      return this.fetch(requestInit ? new Request(input, requestInit) : input, Env, executionCtx);
    }
    input = input.toString();
    return this.fetch(
      new Request(
        /^https?:\/\//.test(input) ? input : `http://localhost${mergePath("/", input)}`,
        requestInit
      ),
      Env,
      executionCtx
    );
  };
  /**
   * `.fire()` automatically adds a global fetch event listener.
   * This can be useful for environments that adhere to the Service Worker API, such as non-ES module Cloudflare Workers.
   * @deprecated
   * Use `fire` from `hono/service-worker` instead.
   * ```ts
   * import { Hono } from 'hono'
   * import { fire } from 'hono/service-worker'
   *
   * const app = new Hono()
   * // ...
   * fire(app)
   * ```
   * @see https://hono.dev/docs/api/hono#fire
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API
   * @see https://developers.cloudflare.com/workers/reference/migrate-to-module-workers/
   */
  fire = () => {
    addEventListener("fetch", (event) => {
      event.respondWith(this.#dispatch(event.request, event, void 0, event.request.method));
    });
  };
}, "_Hono");

// node_modules/hono/dist/router/reg-exp-router/index.js
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();

// node_modules/hono/dist/router/reg-exp-router/router.js
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();

// node_modules/hono/dist/router/utils.js
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
var createNullObject = /* @__PURE__ */ __name(() => /* @__PURE__ */ Object.create(null), "createNullObject");

// node_modules/hono/dist/router/reg-exp-router/matcher.js
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
var emptyParam = [];
function match(method, path) {
  const matchers = this.buildAllMatchers();
  const match2 = /* @__PURE__ */ __name((method2, path2) => {
    const matcher = matchers[method2] || matchers[METHOD_NAME_ALL];
    const staticMatch = matcher[2][path2];
    if (staticMatch) {
      return staticMatch;
    }
    const match3 = path2.match(matcher[0]);
    if (!match3) {
      return [[], emptyParam];
    }
    const index = match3.indexOf("", 1);
    return [matcher[1][index], match3];
  }, "match2");
  this.match = match2;
  return match2(method, path);
}
__name(match, "match");

// node_modules/hono/dist/router/reg-exp-router/node.js
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
var LABEL_REG_EXP_STR = "[^/]+";
var ONLY_WILDCARD_REG_EXP_STR = ".*";
var TAIL_WILDCARD_REG_EXP_STR = "(?:|/.*)";
var PATH_ERROR = /* @__PURE__ */ Symbol();
var regExpMetaChars = new Set(".\\+*[^]$()");
function compareKey(a, b) {
  if (a.length === 1) {
    return b.length === 1 ? a < b ? -1 : 1 : -1;
  }
  if (b.length === 1) {
    return 1;
  }
  if (a === ONLY_WILDCARD_REG_EXP_STR || a === TAIL_WILDCARD_REG_EXP_STR) {
    return b === TAIL_WILDCARD_REG_EXP_STR ? -1 : 1;
  } else if (b === ONLY_WILDCARD_REG_EXP_STR || b === TAIL_WILDCARD_REG_EXP_STR) {
    return -1;
  }
  if (a === LABEL_REG_EXP_STR) {
    return 1;
  } else if (b === LABEL_REG_EXP_STR) {
    return -1;
  }
  return a.length === b.length ? a < b ? -1 : 1 : b.length - a.length;
}
__name(compareKey, "compareKey");
var Node = /* @__PURE__ */ __name(class _Node {
  // handler index of a dynamic path, or -1 for a static path terminal
  #index;
  #varIndex;
  #children = createNullObject();
  insert(tokens, index, paramMap, context2, isStatic) {
    let node = this;
    for (let i = 0, len = tokens.length; i < len; i++) {
      const token = tokens[i];
      const pattern = token.length === 1 ? token === "*" ? i === len - 1 ? ["", "", ONLY_WILDCARD_REG_EXP_STR] : ["", "", LABEL_REG_EXP_STR] : null : token === "/*" ? ["", "", TAIL_WILDCARD_REG_EXP_STR] : token.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
      let nextNode;
      if (pattern) {
        const name = pattern[1];
        let regexpStr = pattern[2] || LABEL_REG_EXP_STR;
        if (name && pattern[2]) {
          if (regexpStr === ".*") {
            throw PATH_ERROR;
          }
          regexpStr = regexpStr.replace(/^\((?!\?:)(?=[^)]+\)$)/, "(?:");
          if (/\((?!\?:)/.test(regexpStr)) {
            throw PATH_ERROR;
          }
          if (regexpStr.length === 1 && regExpMetaChars.has(regexpStr)) {
            throw PATH_ERROR;
          }
        }
        nextNode = node.#children[regexpStr];
        if (!nextNode) {
          if (regexpStr !== ONLY_WILDCARD_REG_EXP_STR && regexpStr !== TAIL_WILDCARD_REG_EXP_STR) {
            for (const k in node.#children) {
              if (
                // a single-char pattern coexists with single-char literals as a literal does
                (regexpStr.length > 1 || k.length > 1) && k !== ONLY_WILDCARD_REG_EXP_STR && k !== TAIL_WILDCARD_REG_EXP_STR
              ) {
                throw PATH_ERROR;
              }
            }
          }
          nextNode = node.#children[regexpStr] = new _Node();
        }
        if (name !== "") {
          nextNode.#varIndex ??= context2.varIndex++;
          paramMap.push([name, nextNode.#varIndex]);
        }
      } else {
        nextNode = node.#children[token];
        if (!nextNode) {
          for (const k in node.#children) {
            if (k.length > 1 && k !== ONLY_WILDCARD_REG_EXP_STR && k !== TAIL_WILDCARD_REG_EXP_STR) {
              throw PATH_ERROR;
            }
          }
          nextNode = node.#children[token] = new _Node();
        }
      }
      node = nextNode;
    }
    if (node.#index !== void 0) {
      throw PATH_ERROR;
    }
    node.#index = isStatic ? -1 : index;
  }
  buildRegExpStr() {
    const childKeys = Object.keys(this.#children).sort(compareKey);
    const strList = childKeys.map((k) => {
      const c = this.#children[k];
      const childStr = c.buildRegExpStr();
      return childStr === "" ? "" : (typeof c.#varIndex === "number" ? `(${k})@${c.#varIndex}` : regExpMetaChars.has(k) ? `\\${k}` : k) + childStr;
    }).filter(Boolean);
    if (typeof this.#index === "number" && this.#index !== -1) {
      strList.unshift(`#${this.#index}`);
    }
    if (strList.length === 0) {
      return "";
    }
    if (strList.length === 1) {
      return strList[0];
    }
    return "(?:" + strList.join("|") + ")";
  }
}, "_Node");

// node_modules/hono/dist/router/reg-exp-router/trie.js
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
var Trie = /* @__PURE__ */ __name(class {
  #context = { varIndex: 0 };
  #root = new Node();
  #index = 0;
  // dynamic path -> [handler index, param assoc]; static paths are not registered
  paths = createNullObject();
  insert(path, isStatic) {
    if (isStatic) {
      this.#root.insert(path.split(""), 0, [], this.#context, true);
      return;
    }
    const paramAssoc = [];
    const groups = [];
    let markedPath = path;
    for (let i = 0; ; ) {
      let replaced = false;
      markedPath = markedPath.replace(/\{[^}]+\}/g, (m) => {
        const mark = `@\\${i}`;
        groups[i] = [mark, m];
        i++;
        replaced = true;
        return mark;
      });
      if (!replaced) {
        break;
      }
    }
    const tokens = markedPath.match(/(?::[^\/]+)|(?:\/\*$)|./g) || [];
    for (let i = groups.length - 1; i >= 0; i--) {
      const [mark] = groups[i];
      for (let j = tokens.length - 1; j >= 0; j--) {
        if (tokens[j].indexOf(mark) !== -1) {
          tokens[j] = tokens[j].replace(mark, groups[i][1]);
          break;
        }
      }
    }
    this.#root.insert(tokens, this.#index, paramAssoc, this.#context, false);
    this.paths[path] = [this.#index++, paramAssoc];
  }
  buildRegExp() {
    let regexp = this.#root.buildRegExpStr();
    if (regexp === "") {
      return [/^$/, [], []];
    }
    let captureIndex = 0;
    const indexReplacementMap = [];
    const paramReplacementMap = [];
    regexp = regexp.replace(/#(\d+)|@(\d+)|\.\*\$/g, (_, handlerIndex, paramIndex) => {
      if (handlerIndex !== void 0) {
        indexReplacementMap[++captureIndex] = Number(handlerIndex);
        return "$()";
      }
      if (paramIndex !== void 0) {
        paramReplacementMap[Number(paramIndex)] = ++captureIndex;
        return "";
      }
      return "";
    });
    return [new RegExp(`^${regexp}`), indexReplacementMap, paramReplacementMap];
  }
}, "Trie");

// node_modules/hono/dist/router/reg-exp-router/router.js
var wildcardRegExpCache = createNullObject();
function buildWildcardRegExp(path) {
  return wildcardRegExpCache[path] ??= new RegExp(
    `^${path.replace(
      /\/:[^/{}]+(?:\{\[\^\/]\+})?(?=[/{]|$)|\/?\*$|([.\\+*[^\]$()?{}|])/g,
      (match2, metaChar) => metaChar ? `\\${metaChar}` : match2 === "/*" ? TAIL_WILDCARD_REG_EXP_STR : match2 === "*" ? ONLY_WILDCARD_REG_EXP_STR : `/:${LABEL_REG_EXP_STR}`
    )}$`
  );
}
__name(buildWildcardRegExp, "buildWildcardRegExp");
function findMiddleware(middleware, path) {
  for (const k of Object.keys(middleware).sort((a, b) => b.length - a.length)) {
    if (buildWildcardRegExp(k).test(path)) {
      return [...middleware[k]];
    }
  }
  return void 0;
}
__name(findMiddleware, "findMiddleware");
var RegExpRouter = /* @__PURE__ */ __name(class {
  name = "RegExpRouter";
  #middleware;
  #routes;
  #tries;
  constructor() {
    this.#middleware = { [METHOD_NAME_ALL]: createNullObject() };
    this.#routes = { [METHOD_NAME_ALL]: createNullObject() };
    this.#tries = { [METHOD_NAME_ALL]: new Trie() };
  }
  #insertPath(method, path) {
    try {
      this.#tries[method].insert(path, !/\*|\/:/.test(path));
    } catch (e) {
      throw e === PATH_ERROR ? new UnsupportedPathError(path) : e;
    }
  }
  add(method, path, handler) {
    const middleware = this.#middleware;
    const routes = this.#routes;
    if (!middleware) {
      throw new Error(MESSAGE_MATCHER_IS_ALREADY_BUILT);
    }
    if (!middleware[method]) {
      this.#tries[method] = new Trie();
      for (const handlerMap of [middleware, routes]) {
        handlerMap[method] = createNullObject();
        for (const p in handlerMap[METHOD_NAME_ALL]) {
          handlerMap[method][p] = [...handlerMap[METHOD_NAME_ALL][p]];
          this.#insertPath(method, p);
        }
      }
    }
    if (path === "/*") {
      path = "*";
    }
    const methods = method === METHOD_NAME_ALL ? Object.keys(middleware) : [method];
    if (/\*$/.test(path)) {
      const re = buildWildcardRegExp(path);
      for (const m of methods) {
        if (!middleware[m][path]) {
          this.#insertPath(m, path);
          middleware[m][path] = findMiddleware(middleware[m], path) || findMiddleware(middleware[METHOD_NAME_ALL], path) || [];
        }
      }
      for (const handlerMap of [middleware, routes]) {
        for (const m of methods) {
          for (const p in handlerMap[m]) {
            re.test(p) && handlerMap[m][p].push([handler, path]);
          }
        }
      }
      return;
    }
    const paths = checkOptionalParameter(path) || [path];
    for (const path2 of paths) {
      for (const m of methods) {
        if (!routes[m][path2]) {
          this.#insertPath(m, path2);
          routes[m][path2] = findMiddleware(middleware[m], path2) || findMiddleware(middleware[METHOD_NAME_ALL], path2) || [];
        }
        routes[m][path2].push([handler, path2]);
      }
    }
  }
  match = match;
  buildAllMatchers() {
    const matchers = createNullObject();
    for (const method of Object.keys(this.#routes)) {
      matchers[method] = this.#buildMatcher(method);
    }
    this.#middleware = this.#routes = this.#tries = void 0;
    wildcardRegExpCache = createNullObject();
    return matchers;
  }
  #buildMatcher(method) {
    const middleware = this.#middleware[method];
    const routes = this.#routes[method];
    const trie = this.#tries[method];
    const staticMap = createNullObject();
    const handlerData = [];
    const [regexp, indexReplacementMap, paramReplacementMap] = trie.buildRegExp();
    for (const r of [middleware, routes]) {
      for (const path in r) {
        const handlers = r[path];
        const pathData = trie.paths[path];
        if (!pathData) {
          staticMap[path] = [handlers.map(([h]) => [h, createNullObject()]), emptyParam];
          continue;
        }
        handlerData[pathData[0]] = handlers.map(([h, handlerPath]) => [
          h,
          trie.paths[handlerPath][1].reduceRight((map, [key], i) => {
            map[key] = paramReplacementMap[pathData[1][i][1]];
            return map;
          }, createNullObject())
        ]);
      }
    }
    return [regexp, indexReplacementMap.map((i) => handlerData[i]), staticMap];
  }
}, "RegExpRouter");

// node_modules/hono/dist/router/reg-exp-router/prepared-router.js
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();

// node_modules/hono/dist/router/smart-router/index.js
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();

// node_modules/hono/dist/router/smart-router/router.js
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
var SmartRouter = /* @__PURE__ */ __name(class {
  name = "SmartRouter";
  #routers = [];
  #routes = [];
  constructor(init) {
    this.#routers = init.routers;
  }
  add(method, path, handler) {
    if (!this.#routes) {
      throw new Error(MESSAGE_MATCHER_IS_ALREADY_BUILT);
    }
    this.#routes.push([method, path, handler]);
  }
  match(method, path) {
    if (!this.#routes) {
      throw new Error("Fatal error");
    }
    const routers = this.#routers;
    const routes = this.#routes;
    const len = routers.length;
    let i = 0;
    let res;
    for (; i < len; i++) {
      const router = routers[i];
      try {
        for (let i2 = 0, len2 = routes.length; i2 < len2; i2++) {
          router.add(...routes[i2]);
        }
        res = router.match(method, path);
      } catch (e) {
        if (e instanceof UnsupportedPathError) {
          continue;
        }
        throw e;
      }
      this.match = router.match.bind(router);
      this.#routers = [router];
      this.#routes = void 0;
      break;
    }
    if (i === len) {
      throw new Error("Fatal error");
    }
    this.name = `SmartRouter + ${this.activeRouter.name}`;
    return res;
  }
  get activeRouter() {
    if (this.#routes || this.#routers.length !== 1) {
      throw new Error("No active router has been determined yet.");
    }
    return this.#routers[0];
  }
}, "SmartRouter");

// node_modules/hono/dist/router/trie-router/index.js
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();

// node_modules/hono/dist/router/trie-router/router.js
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();

// node_modules/hono/dist/router/trie-router/node.js
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
var emptyParams = createNullObject();
var order = 0;
var Node2 = /* @__PURE__ */ __name(class _Node2 {
  #methods = [];
  #children = createNullObject();
  #patterns = [];
  #pattern;
  #params = emptyParams;
  insert(method, path, handler) {
    let curNode = this;
    const parts = splitRoutingPath(path);
    const possibleKeys = /* @__PURE__ */ new Set();
    let i = 0;
    for (const p of parts) {
      const nextP = parts[++i];
      const pattern = getPattern(p, nextP) || (nextP === void 0 && p && p.indexOf("*") === p.length - 1 ? p : null);
      const isParam = Array.isArray(pattern);
      const key = isParam ? pattern[0] : pattern || p;
      const child = curNode.#children[key] ||= new _Node2();
      if (pattern && !child.#pattern) {
        child.#pattern = pattern;
        curNode.#patterns.push(child);
      }
      curNode = child;
      if (isParam) {
        possibleKeys.add(pattern[1]);
      }
    }
    curNode.#methods.push({
      [method]: {
        handler,
        possibleKeys: [...possibleKeys],
        score: ++order
      }
    });
  }
  #pushHandlerSets(handlerSets, node, method, nodeParams, params) {
    for (let i = 0, len = node.#methods.length; i < len; i++) {
      const m = node.#methods[i];
      const handlerSet = m[method] || m[METHOD_NAME_ALL];
      if (handlerSet) {
        handlerSet.params = createNullObject();
        handlerSets.push(handlerSet);
        for (let i2 = 0, len2 = handlerSet.possibleKeys.length; i2 < len2; i2++) {
          const key = handlerSet.possibleKeys[i2];
          handlerSet.params[key] = params?.[key] && !i2 ? params[key] : nodeParams[key] ?? params?.[key];
        }
      }
    }
  }
  search(method, path) {
    const handlerSets = [];
    this.#params = emptyParams;
    const curNode = this;
    let curNodes = [curNode];
    const parts = splitPath(path);
    const curNodesQueue = [];
    const len = parts.length;
    let partOffsets = null;
    for (let i = 0; i < len; i++) {
      const part = parts[i];
      const isLast = i === len - 1;
      const tempNodes = [];
      for (let j = 0, len2 = curNodes.length; j < len2; j++) {
        const node = curNodes[j];
        const nextNode = node.#children[part];
        if (nextNode) {
          nextNode.#params = node.#params;
          if (isLast) {
            if (nextNode.#children["*"]) {
              this.#pushHandlerSets(handlerSets, nextNode.#children["*"], method, node.#params);
            }
            this.#pushHandlerSets(handlerSets, nextNode, method, node.#params);
          } else {
            tempNodes.push(nextNode);
          }
        }
        for (const child of node.#patterns) {
          const pattern = child.#pattern;
          const params = node.#params === emptyParams ? {} : { ...node.#params };
          if (typeof pattern === "string") {
            if (pattern === "*" || part.startsWith(pattern.slice(0, -1))) {
              this.#pushHandlerSets(handlerSets, child, method, node.#params);
              if (pattern === "*") {
                child.#params = params;
                tempNodes.push(child);
              }
            }
            continue;
          }
          const [, name, matcher] = pattern;
          if (!part && matcher === true) {
            continue;
          }
          if (matcher !== true) {
            if (!partOffsets) {
              partOffsets = [];
              let offset = path[0] === "/" ? 1 : 0;
              for (let p = 0; p < len; p++) {
                partOffsets[p] = offset;
                offset += parts[p].length + 1;
              }
            }
            const restPathString = path.slice(partOffsets[i]);
            const m = matcher.exec(restPathString);
            if (m) {
              params[name] = m[0];
              this.#pushHandlerSets(handlerSets, child, method, node.#params, params);
              if (m[0].length === restPathString.length && child.#children["*"]) {
                this.#pushHandlerSets(
                  handlerSets,
                  child.#children["*"],
                  method,
                  node.#params,
                  params
                );
              }
              for (const _ in child.#children) {
                child.#params = params;
                const componentCount = m[0].match(/\//g)?.length ?? 0;
                const targetCurNodes = curNodesQueue[componentCount] ||= [];
                targetCurNodes.push(child);
                break;
              }
              continue;
            }
          }
          if (matcher === true || matcher.test(part)) {
            params[name] = part;
            if (isLast) {
              this.#pushHandlerSets(handlerSets, child, method, params, node.#params);
              if (child.#children["*"]) {
                this.#pushHandlerSets(
                  handlerSets,
                  child.#children["*"],
                  method,
                  params,
                  node.#params
                );
              }
            } else {
              child.#params = params;
              tempNodes.push(child);
            }
          }
        }
      }
      const shifted = curNodesQueue.shift();
      curNodes = shifted ? tempNodes.concat(shifted) : tempNodes;
    }
    if (handlerSets[1]) {
      handlerSets.sort((a, b) => {
        return a.score - b.score;
      });
    }
    return [handlerSets.map(({ handler, params }) => [handler, params])];
  }
}, "_Node");

// node_modules/hono/dist/router/trie-router/router.js
var TrieRouter = /* @__PURE__ */ __name(class {
  name = "TrieRouter";
  #node = new Node2();
  add(method, path, handler) {
    for (const result of checkOptionalParameter(path) || [path]) {
      this.#node.insert(method, result, handler);
    }
  }
  match(method, path) {
    return this.#node.search(method, path);
  }
}, "TrieRouter");

// node_modules/hono/dist/hono.js
var Hono2 = /* @__PURE__ */ __name(class extends Hono {
  /**
   * Creates an instance of the Hono class.
   *
   * @param options - Optional configuration options for the Hono instance.
   */
  constructor(options = {}) {
    super(options);
    this.router = options.router ?? new SmartRouter({
      routers: [new RegExpRouter(), new TrieRouter()]
    });
  }
}, "Hono");

// src/routes/auth.ts
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();

// src/lib/db.ts
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();

// src/lib/crypto.ts
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
async function sha2562(input) {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}
__name(sha2562, "sha256");
function randomHex(bytes) {
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  return Array.from(arr).map((b) => b.toString(16).padStart(2, "0")).join("");
}
__name(randomHex, "randomHex");
function uuidv4() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  bytes[6] = bytes[6] & 15 | 64;
  bytes[8] = bytes[8] & 63 | 128;
  const hex = Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20)
  ].join("-");
}
__name(uuidv4, "uuidv4");
function isValidEmail(email) {
  if (!email || email.length > 254)
    return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  return re.test(email.trim());
}
__name(isValidEmail, "isValidEmail");
function now() {
  return (/* @__PURE__ */ new Date()).toISOString();
}
__name(now, "now");
function addMinutes(minutes) {
  return new Date(Date.now() + minutes * 6e4).toISOString();
}
__name(addMinutes, "addMinutes");
function addDays(days) {
  return new Date(Date.now() + days * 864e5).toISOString();
}
__name(addDays, "addDays");
function isPast(isoString) {
  return new Date(isoString).getTime() < Date.now();
}
__name(isPast, "isPast");

// src/lib/db.ts
async function getUserByEmail(db, email) {
  const row = await db.prepare("SELECT * FROM users WHERE email = ?1").bind(email).first();
  return row ?? null;
}
__name(getUserByEmail, "getUserByEmail");
async function getUserById(db, id) {
  const row = await db.prepare("SELECT * FROM users WHERE id = ?1").bind(id).first();
  return row ?? null;
}
__name(getUserById, "getUserById");
async function upsertUser(db, email) {
  const existing = await getUserByEmail(db, email);
  if (existing)
    return existing;
  const user = {
    id: uuidv4(),
    email,
    name: null,
    plan: "free",
    created_at: now(),
    updated_at: now()
  };
  await db.prepare(
    "INSERT INTO users (id, email, name, plan, created_at, updated_at) VALUES (?1,?2,?3,?4,?5,?6)"
  ).bind(user.id, user.email, user.name, user.plan, user.created_at, user.updated_at).run();
  return user;
}
__name(upsertUser, "upsertUser");
async function createChallenge(db, email, secretHash, pollSecretHash, devConfirmUrl) {
  const id = uuidv4();
  const expiresAt = addMinutes(15);
  await db.prepare(
    "INSERT INTO challenges (id, email, secret_hash, poll_secret_hash, confirmed, dev_confirm_url, expires_at, created_at) VALUES (?1,?2,?3,?4,0,?5,?6,?7)"
  ).bind(id, email, secretHash, pollSecretHash, devConfirmUrl ?? null, expiresAt, now()).run();
  return id;
}
__name(createChallenge, "createChallenge");
async function getChallenge(db, id) {
  return db.prepare("SELECT * FROM challenges WHERE id = ?1").bind(id).first() ?? null;
}
__name(getChallenge, "getChallenge");
async function confirmChallenge(db, challengeId, userId, sessionId, pollToken) {
  await db.prepare(
    "UPDATE challenges SET confirmed=1, user_id=?2, session_id=?3, poll_token=?4 WHERE id=?1"
  ).bind(challengeId, userId, sessionId, pollToken).run();
}
__name(confirmChallenge, "confirmChallenge");
async function createSession(db, userId, tokenHash, deviceHint) {
  const id = uuidv4();
  const expiresAt = addDays(30);
  const ts = now();
  await db.prepare(
    "INSERT INTO sessions (id, user_id, token_hash, device_hint, created_at, last_used_at, expires_at, revoked_at) VALUES (?1,?2,?3,?4,?5,?5,?6,NULL)"
  ).bind(id, userId, tokenHash, deviceHint, ts, expiresAt).run();
  return id;
}
__name(createSession, "createSession");
async function getSessionByTokenHash(db, tokenHash) {
  return db.prepare("SELECT * FROM sessions WHERE token_hash = ?1").bind(tokenHash).first() ?? null;
}
__name(getSessionByTokenHash, "getSessionByTokenHash");
async function revokeSession(db, sessionId) {
  await db.prepare("UPDATE sessions SET revoked_at=?2 WHERE id=?1").bind(sessionId, now()).run();
}
__name(revokeSession, "revokeSession");
async function touchSession(db, sessionId) {
  await db.prepare("UPDATE sessions SET last_used_at=?2 WHERE id=?1").bind(sessionId, now()).run();
}
__name(touchSession, "touchSession");
async function validateToken(db, token) {
  const hash2 = await sha2562(token);
  const session = await getSessionByTokenHash(db, hash2);
  if (!session)
    return null;
  if (session.revoked_at !== null)
    return null;
  if (isPast(session.expires_at))
    return null;
  const user = await getUserById(db, session.user_id);
  if (!user)
    return null;
  await touchSession(db, session.id);
  return { userId: session.user_id, sessionId: session.id, user };
}
__name(validateToken, "validateToken");
async function rateLimit(db, key, maxCount, windowSeconds) {
  const windowEnd = new Date(Date.now() + windowSeconds * 1e3).toISOString();
  const existing = await db.prepare("SELECT count, window_end FROM rate_limits WHERE key=?1").bind(key).first();
  if (!existing || isPast(existing.window_end)) {
    await db.prepare("INSERT OR REPLACE INTO rate_limits (key, count, window_end) VALUES (?1,1,?2)").bind(key, windowEnd).run();
    return true;
  }
  if (existing.count >= maxCount)
    return false;
  await db.prepare("UPDATE rate_limits SET count=count+1 WHERE key=?1").bind(key).run();
  return true;
}
__name(rateLimit, "rateLimit");
async function getNotesSince(db, userId, since) {
  let notes;
  let tombstones;
  if (!since || since === "0") {
    const res = await db.prepare("SELECT * FROM notes WHERE user_id=?1 AND deleted_at IS NULL").bind(userId).all();
    notes = res.results;
    const tRes = await db.prepare("SELECT id, deleted_at, revision FROM notes WHERE user_id=?1 AND deleted_at IS NOT NULL").bind(userId).all();
    tombstones = tRes.results.map((r) => ({ id: r.id, deletedAt: r.deleted_at, revision: r.revision }));
  } else {
    const res = await db.prepare("SELECT * FROM notes WHERE user_id=?1 AND deleted_at IS NULL AND updated_at > ?2").bind(userId, since).all();
    notes = res.results;
    const tRes = await db.prepare("SELECT id, deleted_at, revision FROM notes WHERE user_id=?1 AND deleted_at IS NOT NULL AND updated_at > ?2").bind(userId, since).all();
    tombstones = tRes.results.map((r) => ({ id: r.id, deletedAt: r.deleted_at, revision: r.revision }));
  }
  return { notes, tombstones };
}
__name(getNotesSince, "getNotesSince");
async function batchUpsertNotes(db, userId, upserts, deletes) {
  const applied = { upserted: [], deleted: [] };
  const conflicts = [];
  const ts = (/* @__PURE__ */ new Date()).toISOString();
  for (const u of upserts) {
    const existing = await db.prepare("SELECT * FROM notes WHERE id=?1 AND user_id=?2").bind(u.id, userId).first();
    if (existing) {
      if (existing.deleted_at !== null) {
        conflicts.push({ id: u.id, reason: "tombstoned", serverRecord: null, serverRevision: existing.revision });
        continue;
      }
      if (existing.revision !== u.expectedRevision) {
        conflicts.push({ id: u.id, reason: "revision_mismatch", serverRecord: existing, serverRevision: existing.revision });
        continue;
      }
      await db.prepare(`UPDATE notes SET
        revision=?3, title=?4, content=?5, type=?6, color=?7, icon=?8, mascot=?9, doodle=?10,
        folder_id=?11, checklist_json=?12, bullets_json=?13, chip_json=?14, photo_url=?15,
        tape_style=?16, tape_position=?17, is_pinned=?18, is_starred=?19, is_today=?20,
        has_reminder=?21, is_archived=?22, is_trash=?23, reminder_at=?24,
        updated_at=?25, deleted_at=NULL
        WHERE id=?1 AND user_id=?2
      `).bind(
        u.id,
        userId,
        existing.revision + 1,
        u.title ?? "",
        u.content ?? null,
        u.type ?? "text",
        u.color ?? "yellow",
        u.icon ?? null,
        u.mascot ?? null,
        u.doodle ?? null,
        u.folderId ?? "personal",
        u.checklistJson ?? null,
        u.bulletsJson ?? null,
        u.chipJson ?? null,
        u.photoUrl ?? null,
        u.tapeStyle ?? null,
        u.tapePosition ?? null,
        u.isPinned ? 1 : 0,
        u.isStarred ? 1 : 0,
        u.isToday ? 1 : 0,
        u.hasReminder ? 1 : 0,
        u.isArchived ? 1 : 0,
        u.isTrash ? 1 : 0,
        u.reminderAt ?? null,
        ts
      ).run();
      applied.upserted.push(u.id);
    } else {
      if (u.expectedRevision !== 0) {
        conflicts.push({ id: u.id, reason: "revision_mismatch", serverRecord: null, serverRevision: 0 });
        continue;
      }
      await db.prepare(`INSERT INTO notes
        (id, user_id, revision, title, content, type, color, icon, mascot, doodle, folder_id,
         checklist_json, bullets_json, chip_json, photo_url, tape_style, tape_position,
         is_pinned, is_starred, is_today, has_reminder, is_archived, is_trash, reminder_at,
         created_at, updated_at, deleted_at)
        VALUES (?1,?2,1,?3,?4,?5,?6,?7,?8,?9,?10,?11,?12,?13,?14,?15,?16,?17,?18,?19,?20,?21,?22,?23,?24,?25,NULL)
      `).bind(
        u.id,
        userId,
        u.title ?? "",
        u.content ?? null,
        u.type ?? "text",
        u.color ?? "yellow",
        u.icon ?? null,
        u.mascot ?? null,
        u.doodle ?? null,
        u.folderId ?? "personal",
        u.checklistJson ?? null,
        u.bulletsJson ?? null,
        u.chipJson ?? null,
        u.photoUrl ?? null,
        u.tapeStyle ?? null,
        u.tapePosition ?? null,
        u.isPinned ? 1 : 0,
        u.isStarred ? 1 : 0,
        u.isToday ? 1 : 0,
        u.hasReminder ? 1 : 0,
        u.isArchived ? 1 : 0,
        u.isTrash ? 1 : 0,
        u.reminderAt ?? null,
        u.createdAt,
        ts
      ).run();
      applied.upserted.push(u.id);
    }
  }
  for (const d of deletes) {
    const existing = await db.prepare("SELECT revision, deleted_at FROM notes WHERE id=?1 AND user_id=?2").bind(d.id, userId).first();
    if (!existing) {
      applied.deleted.push(d.id);
      continue;
    }
    if (existing.deleted_at !== null) {
      applied.deleted.push(d.id);
      continue;
    }
    if (existing.revision !== d.expectedRevision) {
      const full = await db.prepare("SELECT * FROM notes WHERE id=?1 AND user_id=?2").bind(d.id, userId).first();
      conflicts.push({ id: d.id, reason: "revision_mismatch", serverRecord: full ?? null, serverRevision: existing.revision });
      continue;
    }
    await db.prepare("UPDATE notes SET deleted_at=?3, revision=revision+1, updated_at=?3 WHERE id=?1 AND user_id=?2").bind(d.id, userId, ts).run();
    applied.deleted.push(d.id);
  }
  return { applied, conflicts };
}
__name(batchUpsertNotes, "batchUpsertNotes");
async function getDiarySince(db, userId, since) {
  let entries;
  let tombstones;
  if (!since || since === "0") {
    const res = await db.prepare("SELECT * FROM diary_entries WHERE user_id=?1 AND deleted_at IS NULL").bind(userId).all();
    entries = res.results;
    const tRes = await db.prepare("SELECT id, deleted_at, revision FROM diary_entries WHERE user_id=?1 AND deleted_at IS NOT NULL").bind(userId).all();
    tombstones = tRes.results.map((r) => ({ id: r.id, deletedAt: r.deleted_at, revision: r.revision }));
  } else {
    const res = await db.prepare("SELECT * FROM diary_entries WHERE user_id=?1 AND deleted_at IS NULL AND updated_at > ?2").bind(userId, since).all();
    entries = res.results;
    const tRes = await db.prepare("SELECT id, deleted_at, revision FROM diary_entries WHERE user_id=?1 AND deleted_at IS NOT NULL AND updated_at > ?2").bind(userId, since).all();
    tombstones = tRes.results.map((r) => ({ id: r.id, deletedAt: r.deleted_at, revision: r.revision }));
  }
  return { entries, tombstones };
}
__name(getDiarySince, "getDiarySince");
async function batchUpsertDiary(db, userId, upserts, deletes) {
  const applied = { upserted: [], deleted: [] };
  const conflicts = [];
  const ts = (/* @__PURE__ */ new Date()).toISOString();
  for (const u of upserts) {
    const existing = await db.prepare("SELECT * FROM diary_entries WHERE id=?1 AND user_id=?2").bind(u.id, userId).first();
    if (existing) {
      if (existing.deleted_at !== null) {
        conflicts.push({ id: u.id, reason: "tombstoned", serverRecord: null, serverRevision: existing.revision });
        continue;
      }
      if (existing.revision !== u.expectedRevision) {
        conflicts.push({ id: u.id, reason: "revision_mismatch", serverRecord: existing, serverRevision: existing.revision });
        continue;
      }
      await db.prepare(`UPDATE diary_entries SET
        revision=?3, date=?4, mood=?5, weather=?6, title=?7, content=?8,
        photo_url=?9, tape_style=?10, tape_position=?11, updated_at=?12, deleted_at=NULL
        WHERE id=?1 AND user_id=?2
      `).bind(
        u.id,
        userId,
        existing.revision + 1,
        u.date,
        u.mood ?? "happy",
        u.weather ?? null,
        u.title ?? null,
        u.content ?? "",
        u.photoUrl ?? null,
        u.tapeStyle ?? null,
        u.tapePosition ?? null,
        ts
      ).run();
      applied.upserted.push(u.id);
    } else {
      if (u.expectedRevision !== 0) {
        conflicts.push({ id: u.id, reason: "revision_mismatch", serverRecord: null, serverRevision: 0 });
        continue;
      }
      await db.prepare(`INSERT INTO diary_entries
        (id, user_id, revision, date, mood, weather, title, content, photo_url, tape_style, tape_position, created_at, updated_at, deleted_at)
        VALUES (?1,?2,1,?3,?4,?5,?6,?7,?8,?9,?10,?11,?12,NULL)
      `).bind(
        u.id,
        userId,
        u.date,
        u.mood ?? "happy",
        u.weather ?? null,
        u.title ?? null,
        u.content ?? "",
        u.photoUrl ?? null,
        u.tapeStyle ?? null,
        u.tapePosition ?? null,
        u.createdAt,
        ts
      ).run();
      applied.upserted.push(u.id);
    }
  }
  for (const d of deletes) {
    const existing = await db.prepare("SELECT revision, deleted_at FROM diary_entries WHERE id=?1 AND user_id=?2").bind(d.id, userId).first();
    if (!existing || existing.deleted_at !== null) {
      applied.deleted.push(d.id);
      continue;
    }
    if (existing.revision !== d.expectedRevision) {
      const full = await db.prepare("SELECT * FROM diary_entries WHERE id=?1 AND user_id=?2").bind(d.id, userId).first();
      conflicts.push({ id: d.id, reason: "revision_mismatch", serverRecord: full ?? null, serverRevision: existing.revision });
      continue;
    }
    await db.prepare("UPDATE diary_entries SET deleted_at=?3, revision=revision+1, updated_at=?3 WHERE id=?1 AND user_id=?2").bind(d.id, userId, ts).run();
    applied.deleted.push(d.id);
  }
  return { applied, conflicts };
}
__name(batchUpsertDiary, "batchUpsertDiary");
async function getDecorPacksForUser(db, userId) {
  const packs = await db.prepare("SELECT * FROM decor_packs WHERE is_active=1").all();
  const entitlements = await db.prepare("SELECT pack_id FROM entitlements WHERE user_id=?1").bind(userId).all();
  const ownedSet = new Set(entitlements.results.map((e) => e.pack_id));
  return packs.results.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    priceUsdCents: p.price_usd_cents,
    previewAssets: JSON.parse(p.preview_asset_ids),
    fullAssets: ownedSet.has(p.id) ? JSON.parse(p.full_asset_ids) : null,
    owned: ownedSet.has(p.id)
  }));
}
__name(getDecorPacksForUser, "getDecorPacksForUser");
async function grantEntitlement(db, userId, packId, source) {
  await db.prepare("INSERT OR IGNORE INTO entitlements (user_id, pack_id, source, granted_at) VALUES (?1,?2,?3,?4)").bind(userId, packId, source, (/* @__PURE__ */ new Date()).toISOString()).run();
}
__name(grantEntitlement, "grantEntitlement");
async function getIdempotentResponse(db, key) {
  const tenMinAgo = new Date(Date.now() - 10 * 6e4).toISOString();
  await db.prepare("DELETE FROM idempotency_keys WHERE created_at < ?1").bind(tenMinAgo).run();
  return db.prepare("SELECT status_code, response FROM idempotency_keys WHERE key=?1").bind(key).first() ?? null;
}
__name(getIdempotentResponse, "getIdempotentResponse");
async function storeIdempotentResponse(db, key, statusCode, body) {
  await db.prepare("INSERT OR IGNORE INTO idempotency_keys (key, status_code, response, created_at) VALUES (?1,?2,?3,?4)").bind(key, statusCode, JSON.stringify(body), (/* @__PURE__ */ new Date()).toISOString()).run();
}
__name(storeIdempotentResponse, "storeIdempotentResponse");

// src/lib/email.ts
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
var EmailError = class extends Error {
  constructor(message) {
    super(message);
    this.name = "EmailError";
  }
};
__name(EmailError, "EmailError");
async function sendEmail(opts) {
  if (opts.environment === "development") {
    console.log("[DEV MAIL SINK]");
    console.log("  To:", opts.to);
    console.log("  Subject:", opts.subject);
    const text = opts.html.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
    console.log("  Body:", text.slice(0, 500));
    return;
  }
  if (!opts.resendApiKey) {
    throw new EmailError("RESEND_API_KEY not configured \u2014 email delivery unavailable");
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${opts.resendApiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: "FrogiNotes <noreply@froginotes.app>",
      to: [opts.to],
      subject: opts.subject,
      html: opts.html
    })
  });
  if (!res.ok) {
    const body = await res.text();
    throw new EmailError(`Resend error ${res.status}: ${body.slice(0, 200)}`);
  }
}
__name(sendEmail, "sendEmail");

// src/routes/auth.ts
var authRouter = new Hono2();
authRouter.post("/request-challenge", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const email = (body.email ?? "").trim().toLowerCase();
  if (!isValidEmail(email)) {
    return c.json({ error: "invalid_email" }, 400);
  }
  const isDev = c.env.ENVIRONMENT === "development";
  if (!isDev && !c.env.RESEND_API_KEY) {
    return c.json({ error: "email_unavailable", message: "Email service not configured." }, 503);
  }
  const ip = c.req.header("CF-Connecting-IP") ?? c.req.header("X-Forwarded-For") ?? "unknown";
  const allowed = await rateLimit(c.env.DB, `challenge:${ip}`, 3, 5 * 60);
  if (!allowed) {
    return c.json({ error: "rate_limited", retryAfterSeconds: 300 }, 429);
  }
  const secret = randomHex(32);
  const secretHash = await sha2562(secret);
  const pollSecret = randomHex(32);
  const pollSecretHash = await sha2562(pollSecret);
  const baseUrl = new URL(c.req.url).origin;
  const challengeId = await createChallenge(c.env.DB, email, secretHash, pollSecretHash);
  const confirmUrl = `${baseUrl}/api/auth/confirm-challenge?c=${challengeId}&secret=${secret}`;
  if (isDev) {
    await c.env.DB.prepare("UPDATE challenges SET dev_confirm_url=?2 WHERE id=?1").bind(challengeId, confirmUrl).run();
  }
  const emailSubject = `X\xE1c nh\u1EADn \u0111\u0103ng nh\u1EADp FrogiNotes \u{1F438}`;
  const emailHtml = `<div style="font-family:sans-serif"><p><a href="${confirmUrl}">Confirm login</a></p></div>`;
  try {
    await sendEmail({
      to: email,
      subject: emailSubject,
      html: emailHtml,
      environment: c.env.ENVIRONMENT,
      resendApiKey: c.env.RESEND_API_KEY
    });
  } catch (e) {
    if (e instanceof EmailError) {
      console.error("[auth] email error:", e.message);
      return c.json({ error: "email_unavailable", message: "D\u1ECBch v\u1EE5 email t\u1EA1m th\u1EDDi kh\xF4ng kh\u1EA3 d\u1EE5ng." }, 503);
    }
    throw e;
  }
  return c.json({
    challengeId,
    pollSecret,
    // returned ONLY here, ONLY to initiating client; never stored plain
    expiresAt: new Date(Date.now() + 15 * 6e4).toISOString()
  });
});
authRouter.get("/confirm-challenge", async (c) => {
  const challengeId = c.req.query("c") ?? "";
  const secret = c.req.query("secret") ?? "";
  if (!challengeId || !secret) {
    return c.json({ error: "invalid_or_expired" }, 400);
  }
  const challenge = await getChallenge(c.env.DB, challengeId);
  if (!challenge) {
    return c.json({ error: "invalid_or_expired" }, 400);
  }
  if (new Date(challenge.expires_at).getTime() < Date.now()) {
    return c.json({ error: "invalid_or_expired" }, 400);
  }
  if (challenge.confirmed === 1) {
    return new Response(
      '<html><body style="font-family:sans-serif;padding:32px"><h2>\u{1F438} \u0110\xE3 x\xE1c nh\u1EADn r\u1ED3i!</h2><p>Tab n\xE0y c\xF3 th\u1EC3 \u0111\xF3ng.</p></body></html>',
      { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  }
  const providedHash = await sha2562(secret);
  if (providedHash !== challenge.secret_hash) {
    return c.json({ error: "invalid_or_expired" }, 400);
  }
  const user = await upsertUser(c.env.DB, challenge.email);
  const token = randomHex(32);
  const tokenHash = await sha2562(token);
  const ua = c.req.header("User-Agent") ?? "";
  const deviceHint = ua.slice(0, 200);
  const sessionId = await createSession(c.env.DB, user.id, tokenHash, deviceHint);
  await confirmChallenge(c.env.DB, challengeId, user.id, sessionId, token);
  const cookieValue = `frogi_session=${token}; HttpOnly; SameSite=Lax; Max-Age=${30 * 24 * 3600}; Path=/`;
  const isSecure = !c.req.url.startsWith("http://localhost");
  const cookieHeader = isSecure ? `${cookieValue}; Secure` : cookieValue;
  return new Response(
    `<html><body style="font-family:sans-serif;padding:32px;max-width:480px;margin:0 auto">
      <h2 style="color:#2D6A4F">\u{1F438} X\xE1c nh\u1EADn th\xE0nh c\xF4ng!</h2>
      <p>B\u1EA1n \u0111\xE3 \u0111\u0103ng nh\u1EADp v\xE0o FrogiNotes. Tab n\xE0y c\xF3 th\u1EC3 \u0111\xF3ng.</p>
      <p style="color:#666;font-size:12px">Quay l\u1EA1i app FrogiNotes \u0111\u1EC3 ti\u1EBFp t\u1EE5c.</p>
    </body></html>`,
    {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Set-Cookie": cookieHeader
      }
    }
  );
});
authRouter.get("/poll/:challengeId", async (c) => {
  const challengeId = c.req.param("challengeId");
  const pollSecret = c.req.query("ps") ?? "";
  if (!pollSecret || pollSecret.length < 60) {
    return c.json({ error: "poll_secret_required" }, 400);
  }
  const ip = c.req.header("CF-Connecting-IP") ?? c.req.header("X-Forwarded-For") ?? "unknown";
  const allowed = await rateLimit(c.env.DB, `poll:${challengeId}:${ip}`, 1, 2);
  if (!allowed) {
    return c.json({ error: "rate_limited" }, 429);
  }
  const challenge = await getChallenge(c.env.DB, challengeId);
  if (!challenge) {
    return c.json({ error: "not_found" }, 404);
  }
  if (new Date(challenge.expires_at).getTime() < Date.now()) {
    return c.json({ status: "expired" }, 410);
  }
  const providedPollSecretHash = await sha2562(pollSecret);
  if (providedPollSecretHash !== challenge.poll_secret_hash) {
    return c.json({ error: "invalid_poll_secret" }, 403);
  }
  if (challenge.confirmed !== 1 || !challenge.session_id) {
    return c.json({ status: "pending" }, 202);
  }
  const row = await c.env.DB.prepare("SELECT poll_token FROM challenges WHERE id=?1").bind(challengeId).first();
  const pollToken = row?.poll_token ?? null;
  if (!pollToken) {
    return c.json({ status: "already_retrieved" }, 410);
  }
  await c.env.DB.prepare("UPDATE challenges SET poll_token=NULL, dev_confirm_url=NULL WHERE id=?1").bind(challengeId).run();
  return c.json({ status: "confirmed", token: pollToken });
});
authRouter.post("/logout", async (c) => {
  const auth = await getAuthContext(c);
  if (!auth) {
    return c.json({ error: "unauthenticated" }, 401);
  }
  await revokeSession(c.env.DB, auth.sessionId);
  const expiredCookie = "frogi_session=; HttpOnly; SameSite=Lax; Max-Age=0; Path=/";
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": expiredCookie
    }
  });
});
authRouter.get("/me", async (c) => {
  const auth = await getAuthContext(c);
  if (!auth) {
    return c.json({ error: "unauthenticated" }, 401);
  }
  const { user } = auth;
  return c.json({
    id: user.id,
    email: user.email,
    name: user.name,
    plan: user.plan,
    createdAt: user.created_at
  });
});
async function getAuthContext(c) {
  const authHeader = c.req.header("Authorization") ?? "";
  if (authHeader.startsWith("Bearer ")) {
    const token = authHeader.slice(7).trim();
    if (token.length === 64) {
      return validateToken(c.env.DB, token);
    }
  }
  const cookie = c.req.header("Cookie") ?? "";
  const match2 = cookie.match(/(?:^|;\s*)frogi_session=([a-f0-9]{64})(?:;|$)/);
  if (match2) {
    return validateToken(c.env.DB, match2[1]);
  }
  return null;
}
__name(getAuthContext, "getAuthContext");

// src/routes/notes.ts
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
var notesRouter = new Hono2();
var MAX_ITEMS = 100;
var MAX_TITLE_BYTES = 1024;
var MAX_CONTENT_BYTES = 65536;
var MAX_PHOTO_URL_BYTES = 2048;
var MAX_JSON_BYTES = 131072;
function byteLength(s) {
  if (!s)
    return 0;
  return new TextEncoder().encode(s).length;
}
__name(byteLength, "byteLength");
var PLAN_REQUIRED_RESPONSE = {
  ok: false,
  error: "plan_required",
  message: "T\xEDnh n\u0103ng Cloud Sync y\xEAu c\u1EA7u g\xF3i Pro. Vui l\xF2ng n\xE2ng c\u1EA5p \u0111\u1EC3 s\u1EED d\u1EE5ng."
};
notesRouter.get("/", async (c) => {
  const auth = await getAuthContext(c);
  if (!auth)
    return c.json({ error: "unauthenticated" }, 401);
  if (auth.user.plan !== "pro")
    return c.json(PLAN_REQUIRED_RESPONSE, 403);
  const since = c.req.query("since") ?? null;
  const data = await getNotesSince(c.env.DB, auth.userId, since === "0" ? null : since);
  return c.json(data);
});
notesRouter.post("/batch", async (c) => {
  const auth = await getAuthContext(c);
  if (!auth)
    return c.json({ error: "unauthenticated" }, 401);
  if (auth.user.plan !== "pro")
    return c.json(PLAN_REQUIRED_RESPONSE, 403);
  const allowed = await rateLimit(c.env.DB, `notes-batch:${auth.userId}`, 10, 60);
  if (!allowed)
    return c.json({ error: "rate_limited" }, 429);
  const idemKey = c.req.header("Idempotency-Key");
  if (idemKey) {
    const cached = await getIdempotentResponse(c.env.DB, `${auth.userId}:${idemKey}`);
    if (cached) {
      return new Response(cached.response, { status: cached.status_code, headers: { "Content-Type": "application/json" } });
    }
  }
  const body = await c.req.json().catch(() => null);
  if (!body)
    return c.json({ error: "validation_error", details: "invalid JSON" }, 400);
  const upserts = Array.isArray(body.upsert) ? body.upsert : [];
  const deletes = Array.isArray(body.delete) ? body.delete : [];
  if (upserts.length > MAX_ITEMS || deletes.length > MAX_ITEMS) {
    return c.json({ error: "validation_error", details: `Max ${MAX_ITEMS} items per batch` }, 400);
  }
  const validatedUpserts = [];
  for (const item of upserts) {
    const u = item;
    if (typeof u.id !== "string" || !u.id) {
      return c.json({ error: "validation_error", details: "upsert item missing id" }, 400);
    }
    if (typeof u.expectedRevision !== "number") {
      return c.json({ error: "validation_error", details: `upsert ${u.id}: expectedRevision required` }, 400);
    }
    if (byteLength(u.title) > MAX_TITLE_BYTES) {
      return c.json({ error: "validation_error", details: `note ${u.id}: title exceeds ${MAX_TITLE_BYTES} bytes` }, 400);
    }
    if (byteLength(u.content) > MAX_CONTENT_BYTES) {
      return c.json({ error: "validation_error", details: `note ${u.id}: content exceeds ${MAX_CONTENT_BYTES} bytes` }, 400);
    }
    if (byteLength(u.photoUrl) > MAX_PHOTO_URL_BYTES) {
      return c.json({ error: "validation_error", details: `note ${u.id}: photoUrl exceeds ${MAX_PHOTO_URL_BYTES} bytes` }, 400);
    }
    if (byteLength(u.checklistJson) > MAX_JSON_BYTES || byteLength(u.bulletsJson) > MAX_JSON_BYTES) {
      return c.json({ error: "validation_error", details: `note ${u.id}: json field too large` }, 400);
    }
    validatedUpserts.push({
      id: u.id,
      expectedRevision: u.expectedRevision,
      title: u.title ?? "",
      content: u.content ?? null,
      type: u.type ?? "text",
      color: u.color ?? "yellow",
      icon: u.icon ?? null,
      mascot: u.mascot ?? null,
      doodle: u.doodle ?? null,
      folderId: u.folderId ?? "personal",
      checklistJson: u.checklistJson ?? null,
      bulletsJson: u.bulletsJson ?? null,
      chipJson: u.chipJson ?? null,
      photoUrl: u.photoUrl ?? null,
      tapeStyle: u.tapeStyle ?? null,
      tapePosition: u.tapePosition ?? null,
      isPinned: Boolean(u.isPinned),
      isStarred: Boolean(u.isStarred),
      isToday: Boolean(u.isToday),
      hasReminder: Boolean(u.hasReminder),
      isArchived: Boolean(u.isArchived),
      isTrash: Boolean(u.isTrash),
      reminderAt: u.reminderAt ?? null,
      createdAt: u.createdAt ?? (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: u.updatedAt ?? (/* @__PURE__ */ new Date()).toISOString()
    });
  }
  const validatedDeletes = [];
  for (const item of deletes) {
    const d = item;
    if (typeof d.id !== "string" || !d.id) {
      return c.json({ error: "validation_error", details: "delete item missing id" }, 400);
    }
    if (typeof d.expectedRevision !== "number") {
      return c.json({ error: "validation_error", details: `delete ${d.id}: expectedRevision required` }, 400);
    }
    validatedDeletes.push({ id: d.id, expectedRevision: d.expectedRevision });
  }
  const result = await batchUpsertNotes(c.env.DB, auth.userId, validatedUpserts, validatedDeletes);
  const response = { ok: true, applied: result.applied, conflicts: result.conflicts };
  if (idemKey) {
    await storeIdempotentResponse(c.env.DB, `${auth.userId}:${idemKey}`, 200, response);
  }
  return c.json(response);
});

// src/routes/diary.ts
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
var diaryRouter = new Hono2();
var MAX_ITEMS2 = 100;
var MAX_CONTENT_BYTES2 = 65536;
var MAX_PHOTO_URL_BYTES2 = 2048;
function byteLength2(s) {
  if (!s)
    return 0;
  return new TextEncoder().encode(s).length;
}
__name(byteLength2, "byteLength");
var PLAN_REQUIRED_RESPONSE2 = {
  ok: false,
  error: "plan_required",
  message: "T\xEDnh n\u0103ng Cloud Sync y\xEAu c\u1EA7u g\xF3i Pro. Vui l\xF2ng n\xE2ng c\u1EA5p \u0111\u1EC3 s\u1EED d\u1EE5ng."
};
diaryRouter.get("/", async (c) => {
  const auth = await getAuthContext(c);
  if (!auth)
    return c.json({ error: "unauthenticated" }, 401);
  if (auth.user.plan !== "pro")
    return c.json(PLAN_REQUIRED_RESPONSE2, 403);
  const since = c.req.query("since") ?? null;
  const data = await getDiarySince(c.env.DB, auth.userId, since === "0" ? null : since);
  return c.json(data);
});
diaryRouter.post("/batch", async (c) => {
  const auth = await getAuthContext(c);
  if (!auth)
    return c.json({ error: "unauthenticated" }, 401);
  if (auth.user.plan !== "pro")
    return c.json(PLAN_REQUIRED_RESPONSE2, 403);
  const allowed = await rateLimit(c.env.DB, `diary-batch:${auth.userId}`, 10, 60);
  if (!allowed)
    return c.json({ error: "rate_limited" }, 429);
  const idemKey = c.req.header("Idempotency-Key");
  if (idemKey) {
    const cached = await getIdempotentResponse(c.env.DB, `${auth.userId}:diary:${idemKey}`);
    if (cached) {
      return new Response(cached.response, { status: cached.status_code, headers: { "Content-Type": "application/json" } });
    }
  }
  const body = await c.req.json().catch(() => null);
  if (!body)
    return c.json({ error: "validation_error", details: "invalid JSON" }, 400);
  const upserts = Array.isArray(body.upsert) ? body.upsert : [];
  const deletes = Array.isArray(body.delete) ? body.delete : [];
  if (upserts.length > MAX_ITEMS2 || deletes.length > MAX_ITEMS2) {
    return c.json({ error: "validation_error", details: `Max ${MAX_ITEMS2} items per batch` }, 400);
  }
  const validatedUpserts = [];
  for (const item of upserts) {
    const u = item;
    if (typeof u.id !== "string" || !u.id)
      return c.json({ error: "validation_error", details: "missing id" }, 400);
    if (typeof u.expectedRevision !== "number")
      return c.json({ error: "validation_error", details: `${u.id}: expectedRevision required` }, 400);
    if (!u.date || typeof u.date !== "string")
      return c.json({ error: "validation_error", details: `${u.id}: date required` }, 400);
    if (byteLength2(u.content) > MAX_CONTENT_BYTES2)
      return c.json({ error: "validation_error", details: `${u.id}: content too large` }, 400);
    if (byteLength2(u.photoUrl) > MAX_PHOTO_URL_BYTES2)
      return c.json({ error: "validation_error", details: `${u.id}: photoUrl too large` }, 400);
    validatedUpserts.push({
      id: u.id,
      expectedRevision: u.expectedRevision,
      date: u.date,
      mood: u.mood ?? "happy",
      weather: u.weather ?? null,
      title: u.title ?? null,
      content: u.content ?? "",
      photoUrl: u.photoUrl ?? null,
      tapeStyle: u.tapeStyle ?? null,
      tapePosition: u.tapePosition ?? null,
      createdAt: u.createdAt ?? (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: u.updatedAt ?? (/* @__PURE__ */ new Date()).toISOString()
    });
  }
  const validatedDeletes = [];
  for (const item of deletes) {
    const d = item;
    if (typeof d.id !== "string" || !d.id)
      return c.json({ error: "validation_error", details: "missing id" }, 400);
    if (typeof d.expectedRevision !== "number")
      return c.json({ error: "validation_error", details: `${d.id}: expectedRevision required` }, 400);
    validatedDeletes.push({ id: d.id, expectedRevision: d.expectedRevision });
  }
  const result = await batchUpsertDiary(c.env.DB, auth.userId, validatedUpserts, validatedDeletes);
  const response = { ok: true, applied: result.applied, conflicts: result.conflicts };
  if (idemKey) {
    await storeIdempotentResponse(c.env.DB, `${auth.userId}:diary:${idemKey}`, 200, response);
  }
  return c.json(response);
});

// src/routes/decor.ts
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
var decorRouter = new Hono2();
decorRouter.get("/packs", async (c) => {
  const auth = await getAuthContext(c);
  if (!auth)
    return c.json({ error: "unauthenticated" }, 401);
  const packs = await getDecorPacksForUser(c.env.DB, auth.userId);
  return c.json({ packs });
});
decorRouter.post("/checkout", async (c) => {
  const auth = await getAuthContext(c);
  if (!auth)
    return c.json({ error: "unauthenticated" }, 401);
  return c.json(
    { ok: false, error: "Thanh to\xE1n ch\u01B0a kh\u1EA3 d\u1EE5ng. Vui l\xF2ng th\u1EED l\u1EA1i sau." },
    503
  );
});

// src/routes/dev.ts
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
var devRouter = new Hono2();
devRouter.post("/seed-entitlement", async (c) => {
  if (c.env.ENVIRONMENT !== "development") {
    return c.json({ error: "not_found" }, 404);
  }
  const devSeedHeader = c.req.header("X-Dev-Seed");
  const expectedSecret = c.env.DEV_SEED_SECRET;
  if (!devSeedHeader || !expectedSecret || devSeedHeader !== expectedSecret) {
    return c.json({ error: "forbidden" }, 403);
  }
  const body = await c.req.json().catch(() => ({}));
  if (!body.email || !body.packId) {
    return c.json({ error: "email and packId required" }, 400);
  }
  const user = await upsertUser(c.env.DB, body.email.trim().toLowerCase());
  await grantEntitlement(c.env.DB, user.id, body.packId, "seed_dev");
  return c.json({ ok: true, userId: user.id, packId: body.packId });
});
devRouter.post("/seed-packs", async (c) => {
  if (c.env.ENVIRONMENT !== "development") {
    return c.json({ error: "not_found" }, 404);
  }
  const devSeedHeader = c.req.header("X-Dev-Seed");
  if (!devSeedHeader || devSeedHeader !== c.env.DEV_SEED_SECRET) {
    return c.json({ error: "forbidden" }, 403);
  }
  const ts = (/* @__PURE__ */ new Date()).toISOString();
  const packs = [
    { id: "pack-free-sample", name: "Washi Sakura Sample", description: "B\u0103ng d\xE1n washi m\xE0u sakura \u2014 mi\u1EC5n ph\xED cho m\u1ECDi t\xE0i kho\u1EA3n", price: 0, preview: '["tape-sakura-preview"]', full: '["tape-sakura-pink","tape-sakura-white"]' },
    { id: "pack-pastel-dream", name: "Pastel Dream", description: "3 m\xE0u tape pastel + 2 pattern \u2014 s\u1EAFp ra m\u1EAFt", price: 299, preview: '["tape-pastel-preview-1","tape-pastel-preview-2"]', full: '["tape-lavender","tape-mint","tape-peach","pattern-dots","pattern-stripe"]' },
    { id: "pack-forest-cozy", name: "Forest Cozy", description: "3 m\xE0u tape r\u1EEBng + doodles c\xE2y \u2014 s\u1EAFp ra m\u1EAFt", price: 299, preview: '["tape-forest-preview"]', full: '["tape-pine","tape-moss","tape-bark","doodle-tree","doodle-leaf","doodle-mushroom"]' }
  ];
  for (const p of packs) {
    await c.env.DB.prepare(
      "INSERT OR IGNORE INTO decor_packs (id, name, description, price_usd_cents, is_active, preview_asset_ids, full_asset_ids, created_at) VALUES (?1,?2,?3,?4,1,?5,?6,?7)"
    ).bind(p.id, p.name, p.description, p.price, p.preview, p.full, ts).run();
  }
  return c.json({ ok: true, seeded: packs.length });
});
devRouter.post("/simulate-payment", async (c) => {
  if (c.env.ENVIRONMENT !== "development") {
    return c.json({ error: "not_found" }, 404);
  }
  const body = await c.req.json().catch(() => ({}));
  if (!body.orderId) {
    return c.json({ ok: false, error: "orderId required" }, 400);
  }
  const row = await c.env.DB.prepare(
    "SELECT id, user_id, plan, status, expires_at FROM orders WHERE id=?1"
  ).bind(body.orderId).first();
  if (!row)
    return c.json({ ok: false, error: "order_not_found" }, 404);
  if (row.status === "completed")
    return c.json({ ok: true, message: "already_completed", orderId: row.id });
  const completedAt = (/* @__PURE__ */ new Date()).toISOString();
  await c.env.DB.prepare(
    "UPDATE orders SET status='completed', completed_at=?2 WHERE id=?1"
  ).bind(body.orderId, completedAt).run();
  await c.env.DB.prepare(
    "UPDATE users SET plan=?2, updated_at=?3 WHERE id=?1"
  ).bind(row.user_id, row.plan, completedAt).run();
  return c.json({ ok: true, orderId: row.id, status: "completed", plan: row.plan });
});

// src/routes/payment.ts
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();

// node_modules/@gpmpay/sdk/dist/vietqr/index.js
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
var BRAND = /* @__PURE__ */ Symbol.for("gpmpay.sdk.error");
var GpmPayError = /* @__PURE__ */ __name(class extends Error {
  code;
  /** @internal Cross-realm brand — `instanceof` breaks across CJS/ESM copies. */
  [BRAND] = true;
  constructor(message, code) {
    super(message);
    this.name = new.target.name;
    this.code = code;
    Object.setPrototypeOf(this, new.target.prototype);
  }
  /**
   * Prefer this over `instanceof` when a dual CJS/ESM install could put two
   * copies of the class in one process.
   */
  static isGpmPayError(value) {
    return typeof value === "object" && value !== null && value[BRAND] === true;
  }
}, "GpmPayError");
var DESCRIPTION_MAX_LENGTH = 25;
function isDynamic(amount) {
  return amount !== void 0 && amount !== null && amount !== "";
}
__name(isDynamic, "isDynamic");
function trimDescription(description) {
  return description === void 0 ? void 0 : description.slice(0, DESCRIPTION_MAX_LENGTH);
}
__name(trimDescription, "trimDescription");
function buildVietQrImageUrl(input) {
  const { bankBin, accountNumber, amount, template = "compact" } = input;
  const trimmedDesc = trimDescription(input.description);
  const url = new URL(
    `https://img.vietqr.io/image/${bankBin}-${accountNumber}-${template}.png`
  );
  if (isDynamic(amount))
    url.searchParams.set("amount", String(amount));
  if (trimmedDesc)
    url.searchParams.set("addInfo", trimmedDesc);
  if (input.accountName !== void 0) {
    url.searchParams.set("accountName", input.accountName);
  }
  return url.toString();
}
__name(buildVietQrImageUrl, "buildVietQrImageUrl");

// node_modules/@gpmpay/sdk/dist/webhooks/index.js
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
init_crypto2();
var BRAND2 = /* @__PURE__ */ Symbol.for("gpmpay.sdk.error");
var GpmPayError2 = /* @__PURE__ */ __name(class extends Error {
  code;
  /** @internal Cross-realm brand — `instanceof` breaks across CJS/ESM copies. */
  [BRAND2] = true;
  constructor(message, code) {
    super(message);
    this.name = new.target.name;
    this.code = code;
    Object.setPrototypeOf(this, new.target.prototype);
  }
  /**
   * Prefer this over `instanceof` when a dual CJS/ESM install could put two
   * copies of the class in one process.
   */
  static isGpmPayError(value) {
    return typeof value === "object" && value !== null && value[BRAND2] === true;
  }
}, "GpmPayError");
var GpmPayWebhookSignatureError = /* @__PURE__ */ __name(class extends GpmPayError2 {
  reason;
  constructor(message, reason) {
    super(message, "webhook_signature");
    this.reason = reason;
  }
}, "GpmPayWebhookSignatureError");
var SIGNATURE_HEADER = "X-GPMPay-Signature";
var EVENT_HEADER = "X-GPMPay-Event";
var DEFAULT_TOLERANCE_SECONDS = 300;
function toBuffer(input) {
  if (Buffer.isBuffer(input))
    return input;
  if (typeof input === "string")
    return Buffer.from(input, "utf8");
  return Buffer.from(input);
}
__name(toBuffer, "toBuffer");
function parseSignatureHeader(signature) {
  const parts = {};
  for (const segment of signature.split(",")) {
    const index = segment.indexOf("=");
    if (index > 0) {
      parts[segment.slice(0, index).trim()] = segment.slice(index + 1).trim();
    }
  }
  return parts;
}
__name(parseSignatureHeader, "parseSignatureHeader");
function assertWebhookSignature(input) {
  const { signature, secret, now: now3 = Date.now } = input;
  const tolerance = input.toleranceSeconds ?? DEFAULT_TOLERANCE_SECONDS;
  if (typeof secret !== "string" || secret === "") {
    throw new GpmPayWebhookSignatureError(
      "Webhook secret is empty. Pass the secret you configured on the webhook setting (e.g. process.env.GPMPAY_WEBHOOK_SECRET).",
      "missing_secret"
    );
  }
  if (typeof signature !== "string" || signature.trim() === "") {
    throw new GpmPayWebhookSignatureError(
      `Missing ${SIGNATURE_HEADER} header.`,
      "malformed_header"
    );
  }
  const parts = parseSignatureHeader(signature);
  const timestamp = Number(parts.t);
  const v1 = parts.v1;
  if (!Number.isFinite(timestamp) || timestamp <= 0 || !v1) {
    throw new GpmPayWebhookSignatureError(
      `Malformed ${SIGNATURE_HEADER}: "${signature}". Expected "t=<unix_seconds>,v1=<hex>".`,
      "malformed_header"
    );
  }
  if (tolerance > 0 && Math.abs(now3() / 1e3 - timestamp) > tolerance) {
    throw new GpmPayWebhookSignatureError(
      `Webhook timestamp is outside the ${String(tolerance)}s tolerance (t=${String(timestamp)}). Check for clock skew between your server and GPM Pay.`,
      "timestamp_skew"
    );
  }
  const raw2 = toBuffer(input.rawBody);
  const expected = createHmac("sha256", secret).update(Buffer.concat([Buffer.from(`${String(timestamp)}.`, "utf8"), raw2])).digest();
  const provided = Buffer.from(v1, "hex");
  if (expected.length !== provided.length || !timingSafeEqual(expected, provided)) {
    throw new GpmPayWebhookSignatureError(
      "Webhook signature mismatch \u2014 wrong secret, or the body was modified in transit. Make sure you are verifying the raw request body, not a re-serialized object.",
      "mismatch"
    );
  }
  return { timestamp };
}
__name(assertWebhookSignature, "assertWebhookSignature");
function headerValue(headers, name) {
  if (!headers)
    return void 0;
  const target = name.toLowerCase();
  for (const [key, value] of Object.entries(headers)) {
    if (key.toLowerCase() !== target)
      continue;
    return Array.isArray(value) ? value[0] : value;
  }
  return void 0;
}
__name(headerValue, "headerValue");
function constructWebhookEvent(input) {
  const { timestamp } = assertWebhookSignature(input);
  const rawBody = toBuffer(input.rawBody).toString("utf8");
  return {
    type: headerValue(input.headers, EVENT_HEADER) ?? "transaction.created",
    timestamp,
    payload: JSON.parse(rawBody),
    rawBody
  };
}
__name(constructWebhookEvent, "constructWebhookEvent");

// src/routes/payment.ts
async function getGpmClient(token) {
  const { GpmPay: GpmPay2 } = await Promise.resolve().then(() => (init_dist(), dist_exports));
  return new GpmPay2({ apiToken: token });
}
__name(getGpmClient, "getGpmClient");
var paymentRouter = new Hono2();
var PRICES = {
  "cloud:monthly": 5e4,
  "cloud:yearly": 5e5,
  // legacy aliases kept for forward-compat
  "pro:monthly": 5e4,
  "pro:yearly": 5e5
};
var DEFAULT_PERIOD = "monthly";
var FALLBACK_BANK_BIN = "970422";
var FALLBACK_ACCOUNT_NO = "9704198526191432198";
function makeOrderId() {
  const ts = Date.now().toString(36).toUpperCase();
  const rnd = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `FRG${ts}${rnd}`;
}
__name(makeOrderId, "makeOrderId");
async function buildQrUrl(apiToken, amount, description) {
  if (apiToken) {
    try {
      const client = await getGpmClient(apiToken);
      const accounts = await client.bankAccounts.list({ status: "ACTIVE" });
      const account = accounts.data[0];
      if (account?.bank?.bin && account.accountNumber) {
        return buildVietQrImageUrl({
          bankBin: account.bank.bin,
          accountNumber: account.accountNumber,
          amount,
          description
        });
      }
    } catch (err) {
      console.warn("[payment] GpmPay bankAccounts.list failed, using fallback:", err.message);
    }
  }
  return buildVietQrImageUrl({
    bankBin: FALLBACK_BANK_BIN,
    accountNumber: FALLBACK_ACCOUNT_NO,
    amount,
    description
  });
}
__name(buildQrUrl, "buildQrUrl");
paymentRouter.post("/create-order", async (c) => {
  const auth = await getAuthContext(c);
  if (!auth)
    return c.json({ error: "unauthenticated" }, 401);
  const body = await c.req.json().catch(() => ({}));
  const plan = body.plan ?? "cloud";
  const period = body.period ?? DEFAULT_PERIOD;
  if (period !== "monthly" && period !== "yearly") {
    return c.json({ ok: false, error: "invalid_period", message: "period must be 'monthly' or 'yearly'." }, 400);
  }
  const priceKey = `${plan}:${period}`;
  const amount = PRICES[priceKey];
  if (!amount) {
    return c.json({ ok: false, error: "invalid_plan", message: `Unknown plan/period: ${priceKey}` }, 400);
  }
  const orderId = makeOrderId();
  const code = `FRG${orderId}`;
  const transferDescription = `FRG ${orderId}`;
  const now3 = (/* @__PURE__ */ new Date()).toISOString();
  const expiresAt = new Date(Date.now() + 30 * 60 * 1e3).toISOString();
  const qrUrl = await buildQrUrl(
    c.env.GPMPAY_API_TOKEN,
    amount,
    code
  );
  await c.env.DB.prepare(
    `INSERT INTO orders (id, user_id, plan, period, amount, transfer_description, status, created_at, expires_at)
     VALUES (?1, ?2, ?3, ?4, ?5, ?6, 'pending', ?7, ?8)`
  ).bind(orderId, auth.userId, plan, period, amount, transferDescription, now3, expiresAt).run();
  return c.json({
    ok: true,
    orderId,
    code,
    amount,
    currency: "VND",
    period,
    qrUrl,
    transferDescription,
    expiresAt,
    status: "pending"
  });
});
paymentRouter.get("/order/:orderId", async (c) => {
  const auth = await getAuthContext(c);
  if (!auth)
    return c.json({ error: "unauthenticated" }, 401);
  const orderId = c.req.param("orderId");
  const row = await c.env.DB.prepare(
    "SELECT id, user_id, plan, period, amount, status, created_at, expires_at, completed_at FROM orders WHERE id=?1"
  ).bind(orderId).first();
  if (!row)
    return c.json({ ok: false, error: "not_found" }, 404);
  if (row.user_id !== auth.userId)
    return c.json({ ok: false, error: "forbidden" }, 403);
  let status = row.status;
  if (status === "pending" && new Date(row.expires_at).getTime() < Date.now()) {
    status = "expired";
    await c.env.DB.prepare("UPDATE orders SET status='expired' WHERE id=?1").bind(orderId).run();
  }
  return c.json({
    ok: true,
    orderId: row.id,
    plan: row.plan,
    period: row.period,
    amount: row.amount,
    currency: "VND",
    status,
    createdAt: row.created_at,
    expiresAt: row.expires_at,
    completedAt: row.completed_at
  });
});
paymentRouter.post("/webhook", async (c) => {
  const rawBody = await c.req.text();
  const webhookSecret = c.env.GPMPAY_WEBHOOK_SECRET;
  let event;
  if (webhookSecret) {
    const signature = c.req.header("x-gpmpay-signature") ?? "";
    try {
      event = constructWebhookEvent({
        rawBody,
        signature,
        secret: webhookSecret
      });
    } catch (err) {
      if (err instanceof GpmPayWebhookSignatureError || err?.code === "webhook_signature") {
        console.warn("[payment/webhook] invalid signature:", err.message);
        return c.json({ ok: false, error: "invalid_signature" }, 401);
      }
      throw err;
    }
  } else {
    console.warn("[payment/webhook] GPMPAY_WEBHOOK_SECRET not set \u2014 skipping signature verification");
    event = {
      type: "transaction.created",
      timestamp: Math.floor(Date.now() / 1e3),
      payload: JSON.parse(rawBody),
      rawBody
    };
  }
  const raw2 = event.payload;
  const payload = {
    id: raw2.id ?? `tx_${Date.now()}`,
    transferType: raw2.transferType ?? "in",
    transferAmount: raw2.transferAmount ?? raw2.amount ?? 0,
    content: raw2.content ?? raw2.transferDescription ?? "",
    referenceCode: raw2.referenceCode,
    gateway: raw2.gateway,
    source: raw2.source,
    test: raw2.test
  };
  if (payload.test === true) {
    return c.json({ ok: true, message: "ping_received" });
  }
  if (payload.transferType !== "in") {
    return c.json({ ok: true, message: "ignored_transfer_type" });
  }
  const contentMatch = payload.content?.match(/FRG[\s_:-]+(FRG[A-Z0-9]+)/i) ?? payload.content?.match(/\b(FRG[A-Z0-9]{8,})\b/i);
  if (!contentMatch) {
    return c.json({ ok: true, message: "no_order_code_in_content" });
  }
  const orderId = contentMatch[1];
  const existingByTx = await c.env.DB.prepare(
    "SELECT id FROM orders WHERE webhook_tx_id=?1 LIMIT 1"
  ).bind(payload.id).first().catch(() => null);
  if (existingByTx) {
    return c.json({ ok: true, message: "already_processed" });
  }
  const row = await c.env.DB.prepare(
    "SELECT id, user_id, plan, amount, status, expires_at FROM orders WHERE id=?1"
  ).bind(orderId).first();
  if (!row) {
    return c.json({ ok: true, message: "order_not_found_ignored" });
  }
  if (row.status === "completed") {
    return c.json({ ok: true, message: "already_completed" });
  }
  if (row.status === "expired" || new Date(row.expires_at).getTime() < Date.now()) {
    return c.json({ ok: true, message: "order_expired_ignored" });
  }
  if (payload.transferAmount !== row.amount) {
    console.warn(`[payment/webhook] amount mismatch for order ${orderId}: expected ${row.amount}, got ${payload.transferAmount}`);
    return c.json({ ok: true, message: "amount_mismatch_ignored" });
  }
  const completedAt = (/* @__PURE__ */ new Date()).toISOString();
  try {
    await c.env.DB.prepare(
      "UPDATE orders SET status='completed', completed_at=?2, webhook_tx_id=?3 WHERE id=?1"
    ).bind(orderId, completedAt, payload.id).run();
  } catch {
    await c.env.DB.prepare(
      "UPDATE orders SET status='completed', completed_at=?2 WHERE id=?1"
    ).bind(orderId, completedAt).run();
  }
  await c.env.DB.prepare(
    "UPDATE users SET plan='pro', updated_at=?2 WHERE id=?1"
  ).bind(row.user_id, completedAt).run();
  console.info(`[payment/webhook] order ${orderId} completed; user ${row.user_id} upgraded to pro`);
  return c.json({ ok: true, orderId, status: "completed", plan: "pro" });
});

// src/index.ts
var app = new Hono2();
var ALLOWED_ORIGINS = /* @__PURE__ */ new Set([
  "http://localhost:5173",
  "http://localhost:8787",
  "https://froginotes.pages.dev"
]);
function corsHeaders(origin) {
  const matched = origin && ALLOWED_ORIGINS.has(origin) ? origin : null;
  const isElectron = origin?.startsWith("app://") || origin?.startsWith("file://");
  const allowOrigin = matched ?? (isElectron ? origin : "null");
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, Idempotency-Key, X-Dev-Seed",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin"
  };
}
__name(corsHeaders, "corsHeaders");
app.options("*", (c) => {
  const origin = c.req.header("Origin");
  return new Response(null, { status: 204, headers: corsHeaders(origin) });
});
app.use("*", async (c, next) => {
  await next();
  const origin = c.req.header("Origin");
  const headers = corsHeaders(origin);
  for (const [k, v] of Object.entries(headers)) {
    c.res.headers.set(k, v);
  }
});
app.route("/api/auth", authRouter);
app.route("/api/notes", notesRouter);
app.route("/api/diary", diaryRouter);
app.route("/api/decor", decorRouter);
app.route("/api/dev", devRouter);
app.route("/api/payment", paymentRouter);
app.get("/api/health", (c) => c.json({ ok: true, version: "0.2.0", environment: c.env.ENVIRONMENT }));
app.notFound((c) => c.json({ error: "not_found" }, 404));
app.onError((err, c) => {
  console.error("[worker error]", err.message);
  return c.json({ error: "internal_error" }, 500);
});
var src_default = app;

// node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
var drainBody = /* @__PURE__ */ __name(async (request, env2, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env2);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env2, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env2);
  } catch (e) {
    const error3 = reduceError(e);
    return Response.json(error3, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-bJngGf/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = src_default;

// node_modules/wrangler/templates/middleware/common.ts
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env2, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env2, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env2, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env2, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-bJngGf/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof __Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
__name(__Facade_ScheduledController__, "__Facade_ScheduledController__");
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env2, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env2, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env2, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env2, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env2, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = (request, env2, ctx) => {
      this.env = env2;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    };
    #dispatcher = (type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    };
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=index.js.map
