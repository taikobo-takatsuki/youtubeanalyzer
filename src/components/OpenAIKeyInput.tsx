"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Sparkles, CheckCircle, ExternalLink } from "lucide-react";

interface OpenAIKeyInputProps {
  apiKey: string;
  onApiKeyChange: (key: string) => void;
}

export function OpenAIKeyInput({ apiKey, onApiKeyChange }: OpenAIKeyInputProps) {
  const [showKey, setShowKey] = useState(false);
  const [tempKey, setTempKey] = useState(apiKey);

  const handleSave = () => {
    onApiKeyChange(tempKey);
    localStorage.setItem("openai_api_key", tempKey);
  };

  const isKeySet = apiKey.length > 0;

  return (
    <Card className="border-dashed border-2 border-violet-700/50 bg-violet-900/10">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-violet-500/20 to-purple-500/20">
            <Sparkles className="h-5 w-5 text-violet-400" />
          </div>
          <div>
            <CardTitle className="text-lg">OpenAI API キー</CardTitle>
            <CardDescription>
              AI高度分析機能を有効にするにはOpenAI APIキーが必要です
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
              placeholder="sk-..."
              value={tempKey}
              onChange={(e) => setTempKey(e.target.value)}
              className="pr-10 border-violet-700/50 focus:border-violet-500"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
            >
              {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <Button 
            onClick={handleSave} 
            disabled={tempKey.length === 0}
            className="bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600"
          >
            保存
          </Button>
        </div>
        <p className="text-xs text-slate-500 mt-3">
          ※ APIキーはブラウザのローカルストレージに保存されます。
          <a
            href="https://platform.openai.com/api-keys"
            target="_blank"
            rel="noopener noreferrer"
            className="text-violet-400 hover:text-violet-300 ml-1 inline-flex items-center gap-1"
          >
            APIキーを取得する <ExternalLink className="h-3 w-3" />
          </a>
        </p>
        <div className="mt-3 p-3 rounded-lg bg-violet-500/10 border border-violet-500/20">
          <p className="text-xs text-violet-300">
            💡 GPT-4 Vision対応のAPIキーが必要です（サムネイル分析用）。
            使用するモデル: gpt-4o-mini（テキスト分析）、gpt-4o（画像分析）
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
