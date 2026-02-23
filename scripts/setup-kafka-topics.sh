#!/bin/bash
# Script to create Kafka topics for PulseOps

set -e

echo "Creating Kafka topics..."

# Wait for Kafka to be ready
echo "Waiting for Kafka to be ready..."
sleep 5

# Create events-raw topic
docker exec pulseops-kafka /opt/kafka/bin/kafka-topics.sh \
  --bootstrap-server localhost:9092 \
  --create \
  --if-not-exists \
  --topic events-raw \
  --partitions 3 \
  --replication-factor 1

echo "✓ Created topic: events-raw"

# List all topics to verify
echo ""
echo "Current Kafka topics:"
docker exec pulseops-kafka /opt/kafka/bin/kafka-topics.sh \
  --bootstrap-server localhost:9092 \
  --list

echo ""
echo "✓ Kafka topics setup complete!"
