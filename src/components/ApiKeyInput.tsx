"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Key, CheckCircle } from "lucide-react";

interface ApiKeyInputProps {
  apiKey: string;
  onApiKeyChange: (key: string) => void;
}

export function ApiKeyInput({ apiKey, onApiKeyChange }: ApiKeyInputProps) {
  const [showKey, setShowKey] = useState(false);
  const [tempKey, setTempKey] = useState(apiKey);

  const handleSave = () => {
    onApiKeyChange(tempKey);
    localStorage.setItem("youtube_api_key", tempKey);
  };

  const isKeySet = apiKey.length > 0;

  return (
    <Card className="border-dashed border-2 border-slate-700/50 bg-slate-900/30">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-rose-500/20 to-orange-500/20">
            <Key className="h-5 w-5 text-rose-400" />
          </div>
          <div>
            <CardTitle className="text-lg">YouTube Data API キー</CardTitle>
            <CardDescription>
              Google Cloud Consoleで取得したAPIキーを入力してください
            </CardDescription>
          </div>
          {isKeySet && (
            <CheckCircle className="h-5 w-5 text-emerald-400 ml-auto" />
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Input
              type={showKey ? "text" : "password"}
              placeholder="AIza..."
              value={tempKey}
              onChange={(e) => setTempKey(e.target.value)}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
            >
              {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <Button onClick={handleSave} disabled={tempKey.length === 0}>
            保存
          </Button>
        </div>
        <p className="text-xs text-slate-500 mt-3">
          ※ APIキーはブラウザのローカルストレージに保存されます。
          <a
            href="https://console.cloud.google.com/apis/credentials"
            target="_blank"
            rel="noopener noreferrer"
            className="text-rose-400 hover:text-rose-300 ml-1"
          >
            APIキーを取得する →
          </a>
        </p>
      </CardContent>
    </Card>
  );
}
