<script setup lang="ts">
interface BasicInfo {
  agentName: string
  agentCode: string
  companyName: string
  companyCode: string
  manager: string
  registrationYear: number
  recentThreeMonthPolicies: number
  lastUpdated: string
}

const basicInfo: BasicInfo = {
  agentName: '徐*雯',
  agentCode: 'E**C738183',
  companyName: '威*保經',
  companyCode: 'BA1296****',
  manager: '940171 張巧勳',
  registrationYear: 2018,
  recentThreeMonthPolicies: 10,
  lastUpdated: '2026 年 2 月'
}
</script>

<template>
  <section class="basic-info-view">
    <header class="top-info">
      <div class="warning-group">
        <p class="warning-title">
          不可外流
        </p>
        <p class="warning-text">
          本分析資料僅供內部使用，請同仁遵守公司資料保密及安全防範管理辦法。
        </p>
      </div>
      <p class="last-updated">
        最後更新時間：{{ basicInfo.lastUpdated }}
      </p>
    </header>

    <article class="basic-info-card">
      <div class="name-row">
        <div class="agent-block">
          <div class="agent-name-row">
            <p class="agent-name">
              {{ basicInfo.agentName }}
            </p>
            <p class="agent-code">
              {{ basicInfo.agentCode }}
            </p>
          </div>

          <div class="company-row">
            <p class="company-name">
              {{ basicInfo.companyName }}
            </p>
            <p class="company-code">
              {{ basicInfo.companyCode }}
            </p>
          </div>
        </div>

        <p class="manager-text">
          管理人：{{ basicInfo.manager }}
        </p>
      </div>

      <hr class="divider">

      <div class="status-row">
        <p class="status-text">
          登錄於 {{ basicInfo.registrationYear }} 年 ｜ 最近三個月有進單 {{ basicInfo.recentThreeMonthPolicies }} 張
        </p>
        <span
          class="status-icon"
          aria-label="status-on"
          role="img"
        >
          ✓
        </span>
      </div>
    </article>
  </section>
</template>

<style scoped>
.basic-info-view {
  width: 100%;
  max-width: 1260px;
  padding: 24px 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  font-family: 'Noto Sans TC', 'PingFang TC', 'Microsoft JhengHei', sans-serif;
  color: #172122;
}

.top-info {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  padding-right: 30px;
  gap: 12px;
}

.warning-group {
  display: flex;
  align-items: flex-end;
  gap: 8px;
}

.warning-title {
  margin: 0;
  font-size: 20px;
  font-weight: 500;
  line-height: 1.5;
  color: #cb4022;
}

.warning-text {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  line-height: 1.5;
  color: #cb4022;
}

.last-updated {
  margin: 0;
  font-size: 16px;
  font-weight: 400;
  line-height: 1.5;
  color: #172122;
}

.basic-info-card {
  background-color: #fff;
  border-radius: 20px;
  box-shadow: 0 6px 16px 0 rgba(23, 33, 34, 0.04);
  padding: 30px 40px 24px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.name-row {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 60px;
}

.agent-block {
  display: flex;
  align-items: center;
  gap: 100px;
}

.agent-name-row {
  display: flex;
  align-items: center;
  gap: 20px;
}

.agent-name,
.agent-code {
  margin: 0;
  font-size: 32px;
  line-height: 1.5;
  color: #172122;
}

.agent-name {
  font-weight: 500;
}

.agent-code {
  font-weight: 400;
}

.company-row {
  display: flex;
  gap: 10px;
}

.company-name,
.company-code {
  margin: 0;
  line-height: 1.5;
  color: #172122;
}

.company-name {
  font-size: 18px;
  font-weight: 500;
}

.company-code {
  font-size: 18px;
  font-weight: 400;
}

.manager-text {
  margin: 0;
  font-size: 16px;
  font-weight: 400;
  line-height: 1.5;
  white-space: nowrap;
}

.divider {
  width: 100%;
  margin: 0;
  border: none;
  border-top: 1px solid #c4eae7;
}

.status-row {
  display: inline-flex;
  align-items: center;
  gap: 2px;
}

.status-text {
  margin: 0;
  font-size: 16px;
  font-weight: 400;
  line-height: 1.5;
  color: #172122;
}

.status-icon {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-color: #47cf8e;
  color: #fff;
  font-size: 14px;
  font-weight: 700;
}

@media (max-width: 1024px) {
  .top-info,
  .name-row,
  .agent-block {
    flex-direction: column;
    align-items: flex-start;
  }

  .manager-text {
    white-space: normal;
  }
}
</style>