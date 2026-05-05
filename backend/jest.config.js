const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;

const dotenv = require("dotenv");
dotenv.config({ path: "./.env" });

/** @type {import("jest").Config} **/
module.exports = {
  testEnvironment: "node",
  transform: {
    ...tsJestTransformCfg,
  },
  preset: "ts-jest",
  testEnvironment: "node",
  verbose: false,
  silent: false,
};