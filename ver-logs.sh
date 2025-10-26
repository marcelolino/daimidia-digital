#!/bin/bash

echo "========================================="
echo "  Logs da Aplicação"
echo "========================================="
echo ""

echo "📋 Últimos logs do container app-server:"
docker logs app-server --tail 100

echo ""
echo "========================================="
