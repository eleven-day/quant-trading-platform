import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Spin, Tabs, Alert, Empty } from 'antd';
import { LineChartOutlined, StockOutlined, FireOutlined, BulbOutlined } from '@ant-design/icons';
import ChartCard from '../components/common/ChartCard';
import StatisticCard from '../components/common/StatisticCard';
import TermTooltip from '../components/common/TermTooltip';
import { fetchDashboardData } from '../utils/api';

const { TabPane } = Tabs;

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await fetchDashboardData();
        setDashboardData(data);
        setError(null);
      } catch (err) {
        console.error('获取仪表盘数据失败:', err);
        setError('获取数据失败，请稍后再试');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // A股指数走势图配置
  const getIndexChartOption = () => {
    if (!dashboardData || !dashboardData.marketIndices) return null;
    
    const { dates, ssec, szse, hs300 } = dashboardData.marketIndices;
    
    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'cross' }
      },
      legend: {
        data: ['上证指数', '深证成指', '沪深300']
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: dates
      },
      yAxis: {
        type: 'value',
        scale: true
      },
      series: [
        {
          name: '上证指数',
          type: 'line',
          data: ssec,
          symbol: 'none',
          smooth: true,
          lineStyle: { width: 2 }
        },
        {
          name: '深证成指',
          type: 'line',
          data: szse,
          symbol: 'none',
          smooth: true,
          lineStyle: { width: 2 }
        },
        {
          name: '沪深300',
          type: 'line',
          data: hs300,
          symbol: 'none',
          smooth: true,
          lineStyle: { width: 2 }
        }
      ]
    };
  };

  // 行业热度图配置
  const getSectorHeatMapOption = () => {
    if (!dashboardData || !dashboardData.sectorPerformance) return null;
    
    const data = dashboardData.sectorPerformance.map(item => ({
      name: item.name,
      value: item.change
    }));
    
    return {
      tooltip: {
        formatter: function (params) {
          return `${params.name}: ${params.value.toFixed(2)}%`;
        }
      },
      visualMap: {
        min: -5,
        max: 5,
        calculable: true,
        orient: 'horizontal',
        left: 'center',
        bottom: '0%',
        inRange: {
          color: ['#c23531', '#fff', '#3f8600']
        }
      },
      series: [
        {
          type: 'treemap',
          data: data,
          label: {
            show: true,
            formatter: '{b}'
          }
        }
      ]
    };
  };

  // 热门策略表现图配置
  const getStrategiesPerformanceOption = () => {
    if (!dashboardData || !dashboardData.strategiesPerformance) return null;
    
    const { dates, strategies } = dashboardData.strategiesPerformance;
    
    const series = strategies.map(s => ({
      name: s.name,
      type: 'line',
      data: s.returns,
      symbol: 'none',
      smooth: true
    }));
    
    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'cross' }
      },
      legend: {
        data: strategies.map(s => s.name)
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: dates
      },
      yAxis: {
        type: 'value',
        name: '累计收益(%)',
        axisLabel: {
          formatter: '{value}%'
        }
      },
      series: series
    };
  };

  if (error) {
    return (
      <Alert
        message="数据加载失败"
        description={error}
        type="error"
        showIcon
      />
    );
  }

  return (
    <div>
      <Spin spinning={loading}>
        {!dashboardData ? (
          <Empty description="暂无数据" />
        ) : (
          <>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={6}>
                <StatisticCard
                  title={<TermTooltip term="上证指数">上证指数</TermTooltip>}
                  value={dashboardData.marketOverview.ssec.value}
                  precision={2}
                  increase={dashboardData.marketOverview.ssec.change}
                />
              </Col>
              <Col xs={24} sm={12} md={6}>
                <StatisticCard
                  title={<TermTooltip term="深证成指">深证成指</TermTooltip>}
                  value={dashboardData.marketOverview.szse.value}
                  precision={2}
                  increase={dashboardData.marketOverview.szse.change}
                />
              </Col>
              <Col xs={24} sm={12} md={6}>
                <StatisticCard
                  title={<TermTooltip term="沪深300">沪深300</TermTooltip>}
                  value={dashboardData.marketOverview.hs300.value}
                  precision={2}
                  increase={dashboardData.marketOverview.hs300.change}
                />
              </Col>
              <Col xs={24} sm={12} md={6}>
                <StatisticCard
                  title={<TermTooltip term="创业板指">创业板指</TermTooltip>}
                  value={dashboardData.marketOverview.gem.value}
                  precision={2}
                  increase={dashboardData.marketOverview.gem.change}
                />
              </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
              <Col xs={24} lg={16}>
                <ChartCard
                  title={<><LineChartOutlined /> A股指数走势</>}
                  option={getIndexChartOption()}
                  height="350px"
                />
              </Col>
              <Col xs={24} lg={8}>
                <ChartCard
                  title={<><FireOutlined /> 行业热度图</>}
                  option={getSectorHeatMapOption()}
                  height="350px"
                />
              </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
              <Col span={24}>
                <Card title={<><BulbOutlined /> 学习进度</>} className="dashboard-card">
                  <Tabs defaultActiveKey="1">
                    <TabPane tab="已完成课程" key="1">
                      <div style={{ height: '200px', overflowY: 'auto' }}>
                        {dashboardData.learningProgress.completed.length > 0 ? (
                          <ul>
                            {dashboardData.learningProgress.completed.map((course, index) => (
                              <li key={index}>{course.title} - {course.completionDate}</li>
                            ))}
                          </ul>
                        ) : (
                          <Empty description="暂无已完成课程" />
                        )}
                      </div>
                    </TabPane>
                    <TabPane tab="推荐学习" key="2">
                      <div style={{ height: '200px', overflowY: 'auto' }}>
                        {dashboardData.learningProgress.recommended.length > 0 ? (
                          <ul>
                            {dashboardData.learningProgress.recommended.map((course, index) => (
                              <li key={index}>{course.title} - {course.level}</li>
                            ))}
                          </ul>
                        ) : (
                          <Empty description="暂无推荐课程" />
                        )}
                      </div>
                    </TabPane>
                  </Tabs>
                </Card>
              </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
              <Col span={24}>
                <ChartCard
                  title={<><StockOutlined /> 热门策略表现</>}
                  option={getStrategiesPerformanceOption()}
                  height="300px"
                />
              </Col>
            </Row>
          </>
        )}
      </Spin>
    </div>
  );
};

export default Dashboard;