import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { load } from "js-yaml";

const POLICY_PATH = path.join(process.cwd(), "..", "policies", "policy.yaml");

export async function GET() {
  try {
    const fileContents = fs.readFileSync(POLICY_PATH, "utf8");
    const policy = load(fileContents) as Record<string, unknown>;

    const rules = (policy.rules as unknown[]) ?? [];

    return NextResponse.json({
      version:     policy.version    ?? "1.0",
      fail_closed: policy.default === "deny",
      default:     policy.default    ?? "deny",
      rules,
      total:       rules.length,
      raw:         fileContents,
    });
  } catch (error) {
    console.error("Policy read error:", error);
    return NextResponse.json(
      { error: true, code: "POLICY_READ_FAILED", message: "Could not read policy file" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { yaml: yamlContent } = await request.json();
    // Validate it's parseable YAML before writing
    load(yamlContent);
    fs.writeFileSync(POLICY_PATH, yamlContent, "utf8");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Policy write error:", error);
    return NextResponse.json(
      { error: true, code: "INVALID_YAML", message: "Invalid YAML or write failed" },
      { status: 400 }
    );
  }
}
