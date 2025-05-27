# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [1.2.0](https://github.com/Sofie-Automation/sofie-casparcg-launcher/compare/v1.1.0...v1.2.0) (2024-12-16)


### Features

* add setting to choose process stdin encoding ([dc0cd51](https://github.com/Sofie-Automation/sofie-casparcg-launcher/commit/dc0cd51b89bf5902e97d0bd8d8cfa9491496d103))
* restyle settings layout, splitting processes table columns into a collapse ([4fe30b3](https://github.com/Sofie-Automation/sofie-casparcg-launcher/commit/4fe30b38c2e6526c36a93b5a85d1c11ff0c0ecdb))
* set env variables for processes ([c518d21](https://github.com/Sofie-Automation/sofie-casparcg-launcher/commit/c518d218c127967fcf20e165754e57bda176f18f))

## [1.1.0](https://github.com/Sofie-Automation/sofie-casparcg-launcher/compare/v1.0.1...v1.1.0) (2022-01-19)


### Features

* add sending commands through stdin ([2a291ed](https://github.com/Sofie-Automation/sofie-casparcg-launcher/commit/2a291ed59280f2cb56310f2bef33a20f3fa2144d))


### Bug Fixes

* make the Settings footer sticky ([6ad21ff](https://github.com/Sofie-Automation/sofie-casparcg-launcher/commit/6ad21ff7b8410dfeca7bce3bc77f00fa4235039f))
* process controls not updating when changing tab ([c677e1c](https://github.com/Sofie-Automation/sofie-casparcg-launcher/commit/c677e1cfdda74711726186687706f776a9c30ff4))

### [1.0.1](https://github.com/Sofie-Automation/sofie-casparcg-launcher/compare/v1.0.0...v1.0.1) (2020-08-20)


### Bug Fixes

* hide menubar and prompting for confirmation on exit in production builds ([4c5193f](https://github.com/Sofie-Automation/sofie-casparcg-launcher/commit/4c5193f29e59e31f9d113755abb5fe074ca73fe1))
* Set CWD to executable file directory ([ea05dc5](https://github.com/Sofie-Automation/sofie-casparcg-launcher/commit/ea05dc551062fec45153b23769bc1bd3d133ada1))

## [1.0.0](https://github.com/Sofie-Automation/sofie-casparcg-launcher/compare/v0.6.1...v1.0.0) (2020-06-15)


### ⚠ BREAKING CHANGES

* upgrade electron

### Features

* upgrade electron ([76025c4](https://github.com/Sofie-Automation/sofie-casparcg-launcher/commit/76025c49dbe340d056bd7e38894aaf9a8d88a3b3))


### Bug Fixes

* Adding a static path ([fd2c638](https://github.com/Sofie-Automation/sofie-casparcg-launcher/commit/fd2c63802e5d014a090294f9b9291d5295527f74))
* broken tables ([02e7a25](https://github.com/Sofie-Automation/sofie-casparcg-launcher/commit/02e7a25d45230539064861e6e5074bf95e0f5c25))
* building package on linux ([85c99dc](https://github.com/Sofie-Automation/sofie-casparcg-launcher/commit/85c99dcae0c9d0f5da97f46f015cf4d8528f34b7))
* openPath buttons crashing app ([50660f5](https://github.com/Sofie-Automation/sofie-casparcg-launcher/commit/50660f549b4218b7d8ea32620ae9854dd7e0cd41))

<a name="0.6.1"></a>
## [0.6.1](https://github.com/Sofie-Automation/sofie-casparcg-launcher/compare/v0.6.0...v0.6.1) (2019-05-21)


### Bug Fixes

* defensive code to handle multiple overlapping restart requests ([8ae4330](https://github.com/Sofie-Automation/sofie-casparcg-launcher/commit/8ae4330))



<a name="0.6.0"></a>
# [0.6.0](https://github.com/Sofie-Automation/sofie-casparcg-launcher/compare/v0.5.3...v0.6.0) (2019-01-30)


### Features

* auto start opt out ([8ed8cb7](https://github.com/Sofie-Automation/sofie-casparcg-launcher/commit/8ed8cb7))



<a name="0.5.3"></a>
## [0.5.3](https://github.com/Sofie-Automation/sofie-casparcg-launcher/compare/v0.5.2...v0.5.3) (2018-12-07)


### Bug Fixes

* Add setting to specify child process and launcher logs path ([7296887](https://github.com/Sofie-Automation/sofie-casparcg-launcher/commit/7296887))
* Ensure that the launcher log dir exists. Guard against exceptions attempting to open launcher-log file ([effa614](https://github.com/Sofie-Automation/sofie-casparcg-launcher/commit/effa614))
* Guard against exception opening process log files ([aa88301](https://github.com/Sofie-Automation/sofie-casparcg-launcher/commit/aa88301))



<a name="0.5.2"></a>
## [0.5.2](https://github.com/Sofie-Automation/sofie-casparcg-launcher/compare/v0.5.1...v0.5.2) (2018-12-04)


### Bug Fixes

* Logs and startup with no basepath set ([7e2041f](https://github.com/Sofie-Automation/sofie-casparcg-launcher/commit/7e2041f))



<a name="0.5.1"></a>
## [0.5.1](https://github.com/Sofie-Automation/sofie-casparcg-launcher/compare/v0.5.0...v0.5.1) (2018-12-04)


### Bug Fixes

* **logs:** Use child process name instead of id in log filename ([b92ee2d](https://github.com/Sofie-Automation/sofie-casparcg-launcher/commit/b92ee2d))



<a name="0.5.0"></a>
# [0.5.0](https://github.com/Sofie-Automation/sofie-casparcg-launcher/compare/v0.4.0...v0.5.0) (2018-12-04)


### Features

* Option to write log files for each process ([4d16a8c](https://github.com/Sofie-Automation/sofie-casparcg-launcher/commit/4d16a8c))



<a name="0.4.0"></a>
# [0.4.0](https://github.com/Sofie-Automation/sofie-casparcg-launcher/compare/v0.3.0...v0.4.0) (2018-11-14)


### Bug Fixes

* Block child windows being opened ([64ec5f7](https://github.com/Sofie-Automation/sofie-casparcg-launcher/commit/64ec5f7))
* downgrade bootstrap-vue to fix issue with input fields ([e867d81](https://github.com/Sofie-Automation/sofie-casparcg-launcher/commit/e867d81))
* Update electron-builder ([ce514fb](https://github.com/Sofie-Automation/sofie-casparcg-launcher/commit/ce514fb))
* various fixes ([2586499](https://github.com/Sofie-Automation/sofie-casparcg-launcher/commit/2586499))


### Features

* **casparcg:** Make casparcg ping healthcheck optional ([7afaf74](https://github.com/Sofie-Automation/sofie-casparcg-launcher/commit/7afaf74))
* Add a status default page to show an overview of every process status ([0dfbde2](https://github.com/Sofie-Automation/sofie-casparcg-launcher/commit/0dfbde2))
* Add version string to bottom of settings page ([1f2e8e9](https://github.com/Sofie-Automation/sofie-casparcg-launcher/commit/1f2e8e9))
* Convert hardcoded set of processes to be a table defined in the config. This will convert existing configs to the new format ([e916786](https://github.com/Sofie-Automation/sofie-casparcg-launcher/commit/e916786))
* Option to allow deleting files within a staticPath. Useful for a folder setup for recordings ([f4caf94](https://github.com/Sofie-Automation/sofie-casparcg-launcher/commit/f4caf94))



<a name="0.3.0"></a>
# [0.3.0](https://github.com/Sofie-Automation/sofie-casparcg-launcher/compare/v0.2.0...v0.3.0) (2018-10-10)


### Bug Fixes

* auto scroll in newer electron ([c42aa0f](https://github.com/Sofie-Automation/sofie-casparcg-launcher/commit/c42aa0f))
* guard against sending ipc messages while shutting down ([35f9854](https://github.com/Sofie-Automation/sofie-casparcg-launcher/commit/35f9854))


### Features

* Improve casparcg timeouts. Detect and ignore system clock changes ([7e80ab6](https://github.com/Sofie-Automation/sofie-casparcg-launcher/commit/7e80ab6))
* Improve logging to file ([dbe30bd](https://github.com/Sofie-Automation/sofie-casparcg-launcher/commit/dbe30bd))
